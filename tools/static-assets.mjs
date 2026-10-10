import { randomBytes } from 'node:crypto';
import {
	chmod,
	copyFile,
	lstat,
	mkdir,
	opendir,
	readFile,
	rename,
	rm,
	writeFile
} from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	parseScriptMetadata,
	validateUniqueSlugs,
	writeScriptRegistry
} from './script-metadata.mjs';

const SCRIPT_EXTENSIONS = new Set(['.py', '.sh']);
const FIXED_DOS_DATE = 0x21;
const UTF8_FLAG = 0x0800;
const ZIP_VERSION = 20;

/** @typedef {{ path: string, relativePath: string, directory: boolean, mode: number }} WalkEntry */

const crcTable = new Uint32Array(256);
for (let value = 0; value < crcTable.length; value += 1) {
	let crc = value;
	for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
	crcTable[value] = crc >>> 0;
}

/** @param {Buffer} bytes */
function crc32(bytes) {
	let crc = 0xffffffff;
	for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
	return (crc ^ 0xffffffff) >>> 0;
}

/** @param {{ name: string }} left @param {{ name: string }} right */
function compareNames(left, right) {
	return Buffer.from(left.name).compare(Buffer.from(right.name));
}

/** @param {string} path @returns {Promise<import('node:fs').Dirent[]>} */
async function readDirectory(path) {
	/** @type {import('node:fs').Dirent[]} */
	const entries = [];
	try {
		const directory = await opendir(path);
		for await (const entry of directory) entries.push(entry);
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return [];
		throw error;
	}
	return entries.sort(compareNames);
}

/** @param {string} path */
function portablePath(path) {
	return path.split(sep).join('/');
}

/**
 * @param {string} path
 * @param {string} [base]
 * @param {boolean} [includeDirectories]
 * @returns {Promise<WalkEntry[]>}
 */
async function walk(path, base = path, includeDirectories = false) {
	/** @type {WalkEntry[]} */
	const found = [];
	for (const entry of await readDirectory(path)) {
		const absolutePath = join(path, entry.name);
		const metadata = await lstat(absolutePath);
		if (metadata.isSymbolicLink())
			throw new Error(`Symbolic links are not supported: ${absolutePath}`);
		if (metadata.isDirectory()) {
			if (includeDirectories)
				found.push({
					path: absolutePath,
					relativePath: `${portablePath(relative(base, absolutePath))}/`,
					directory: true,
					mode: metadata.mode
				});
			found.push(...(await walk(absolutePath, base, includeDirectories)));
		} else if (metadata.isFile()) {
			found.push({
				path: absolutePath,
				relativePath: portablePath(relative(base, absolutePath)),
				directory: false,
				mode: metadata.mode
			});
		} else {
			throw new Error(`Unsupported filesystem entry: ${absolutePath}`);
		}
	}
	return found;
}

/** @param {string} name @param {Buffer} contents @param {boolean} directory */
function zipEntry(name, contents, directory) {
	const encodedName = Buffer.from(name);
	const checksum = crc32(contents);
	const local = Buffer.alloc(30);
	local.writeUInt32LE(0x04034b50, 0);
	local.writeUInt16LE(ZIP_VERSION, 4);
	local.writeUInt16LE(UTF8_FLAG, 6);
	local.writeUInt16LE(0, 8);
	local.writeUInt16LE(0, 10);
	local.writeUInt16LE(FIXED_DOS_DATE, 12);
	local.writeUInt32LE(checksum, 14);
	local.writeUInt32LE(contents.length, 18);
	local.writeUInt32LE(contents.length, 22);
	local.writeUInt16LE(encodedName.length, 26);

	const central = Buffer.alloc(46);
	central.writeUInt32LE(0x02014b50, 0);
	central.writeUInt16LE(0x031e, 4);
	central.writeUInt16LE(ZIP_VERSION, 6);
	central.writeUInt16LE(UTF8_FLAG, 8);
	central.writeUInt16LE(0, 10);
	central.writeUInt16LE(0, 12);
	central.writeUInt16LE(FIXED_DOS_DATE, 14);
	central.writeUInt32LE(checksum, 16);
	central.writeUInt32LE(contents.length, 20);
	central.writeUInt32LE(contents.length, 24);
	central.writeUInt16LE(encodedName.length, 28);
	central.writeUInt32LE(((directory ? 0o40755 : 0o100644) << 16) >>> 0, 38);
	return { local, central, encodedName, contents };
}

/** @param {string} sourceDirectory */
async function createZip(sourceDirectory) {
	const entries = [];
	for (const entry of await walk(sourceDirectory, sourceDirectory, true)) {
		entries.push(
			zipEntry(
				entry.relativePath,
				entry.directory ? Buffer.alloc(0) : await readFile(entry.path),
				entry.directory
			)
		);
	}

	const localParts = [];
	const centralParts = [];
	let offset = 0;
	for (const entry of entries) {
		entry.central.writeUInt32LE(offset, 42);
		localParts.push(entry.local, entry.encodedName, entry.contents);
		centralParts.push(entry.central, entry.encodedName);
		offset += entry.local.length + entry.encodedName.length + entry.contents.length;
	}
	const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(entries.length, 8);
	end.writeUInt16LE(entries.length, 10);
	end.writeUInt32LE(centralSize, 12);
	end.writeUInt32LE(offset, 16);
	return Buffer.concat([...localParts, ...centralParts, end]);
}

/** @param {string} staged @param {string} target */
async function replaceDirectory(staged, target) {
	await rm(target, { recursive: true, force: true });
	await rename(staged, target);
}

/** @param {{ root?: string }} [options] */
export async function buildStaticAssets({ root = process.cwd() } = {}) {
	const repositoryRoot = resolve(root);
	const sourceScripts = join(repositoryRoot, 'scripts');
	const sourceTemplates = join(repositoryRoot, 'templates');
	const staticDirectory = join(repositoryRoot, 'static');
	const staging = join(staticDirectory, `.assets-${process.pid}-${randomBytes(6).toString('hex')}`);
	const stagedScripts = join(staging, 'script');
	const stagedTemplates = join(staging, 'templates');

	await mkdir(stagedScripts, { recursive: true });
	await mkdir(stagedTemplates, { recursive: true });

	try {
		const scripts = (await walk(sourceScripts)).filter((script) =>
			SCRIPT_EXTENSIONS.has(extname(script.relativePath))
		);
		const registry = [];
		for (const script of scripts) {
			let source;
			try {
				source = new TextDecoder('utf-8', { fatal: true }).decode(await readFile(script.path));
			} catch (error) {
				if (error instanceof TypeError) {
					throw new Error(`${script.relativePath}: script metadata must be valid UTF-8`, {
						cause: error
					});
				}
				throw error;
			}
			registry.push(parseScriptMetadata({ source, relativePath: script.relativePath }));
			const destination = join(stagedScripts, script.relativePath);
			await mkdir(dirname(destination), { recursive: true });
			await copyFile(script.path, destination);
			await chmod(destination, script.mode & 0o777);
		}
		validateUniqueSlugs(registry);

		for (const entry of await readDirectory(sourceTemplates)) {
			if (!entry.isDirectory()) continue;
			const source = join(sourceTemplates, entry.name);
			await writeFile(join(stagedTemplates, `${entry.name}.zip`), await createZip(source));
		}

		await replaceDirectory(stagedScripts, join(staticDirectory, 'script'));
		await replaceDirectory(stagedTemplates, join(staticDirectory, 'templates'));
		await writeScriptRegistry(registry, { root: repositoryRoot });
	} finally {
		await rm(staging, { recursive: true, force: true });
	}
}

/** @param {string} pathname */
export function contentTypeForPath(pathname) {
	if (/^\/script\/.+\.py$/.test(pathname)) return 'text/x-python; charset=utf-8';
	if (/^\/script\/.+\.sh$/.test(pathname)) return 'application/x-sh; charset=utf-8';
	if (/^\/templates\/[^/]+\.zip$/.test(pathname)) return 'application/zip';
}

/** @param {{ middlewares: import('vite').ViteDevServer['middlewares'] }} server */
function addContentTypeMiddleware(server) {
	server.middlewares.use((request, response, next) => {
		const contentType = contentTypeForPath(
			new URL(request.url ?? '/', 'http://localhost').pathname
		);
		if (contentType) response.setHeader('Content-Type', contentType);
		next();
	});
}

/** @param {{ root?: string }} [options] @returns {import('vite').Plugin} */
export function staticAssetsPlugin({ root = process.cwd() } = {}) {
	const repositoryRoot = resolve(root);
	const watched = [join(repositoryRoot, 'scripts'), join(repositoryRoot, 'templates')];
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let pending;
	return {
		name: 'static-download-assets',
		configureServer(server) {
			addContentTypeMiddleware(server);
			server.watcher.add(watched);
			server.watcher.on('all', (_event, changedPath) => {
				if (
					!watched.some((path) => changedPath === path || changedPath.startsWith(`${path}${sep}`))
				)
					return;
				clearTimeout(pending);
				pending = setTimeout(async () => {
					try {
						await buildStaticAssets({ root: repositoryRoot });
						server.ws.send({ type: 'full-reload' });
					} catch (error) {
						server.config.logger.error(
							`Static asset generation failed: ${error instanceof Error ? error.message : error}`
						);
					}
				}, 50);
			});
		},
		configurePreviewServer(server) {
			addContentTypeMiddleware(server);
		}
	};
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
	if (process.argv.includes('--clean-build')) {
		await rm(resolve(process.cwd(), 'build'), { recursive: true, force: true });
	}
	await buildStaticAssets();
}
