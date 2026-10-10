import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { parseDocument } from 'yaml';

const REQUIRED_FIELDS = ['name', 'description', 'category', 'platforms', 'risk'];
const OPTIONAL_FIELDS = ['tags'];
const ALLOWED_FIELDS = new Set([...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]);
const RISK_VALUES = new Set(['read-only', 'writes-files', 'system-changes']);

/** @typedef {import('../src/lib/scripts').ScriptRecord} ScriptRecord */
/** @typedef {Pick<ScriptRecord, 'name' | 'description' | 'category' | 'platforms' | 'tags' | 'risk'>} ScriptMetadata */

/** @param {string} sourcePath @param {string} message @returns {never} */
function fail(sourcePath, message) {
	throw new Error(`${sourcePath}: ${message}`);
}

/** @param {string} value */
function dedent(value) {
	const lines = value.replace(/\r\n?/g, '\n').split('\n');
	while (lines[0]?.trim() === '') lines.shift();
	while (lines.at(-1)?.trim() === '') lines.pop();
	const indentation = lines
		.filter((line) => line.trim())
		.map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);
	const width = indentation.length ? Math.min(...indentation) : 0;
	return lines.map((line) => line.slice(width)).join('\n');
}

/** @param {string} source @param {string} sourcePath */
function pythonHeader(source, sourcePath) {
	const match = source.match(
		/^(?:\uFEFF)?(?:#![^\n]*(?:\n|$))?(?:(?:[ \t]*#.*)?(?:\n|$)|[ \t]*\n)*(?:[rRuUbB]{0,2})?("""|''')([\s\S]*?)\1/
	);
	if (!match) fail(sourcePath, 'expected metadata in the first Python module docstring');
	return dedent(match[2]);
}

/** @param {string} source @param {string} sourcePath */
function shellHeader(source, sourcePath) {
	const lines = source.replace(/\r\n?/g, '\n').split('\n');
	let index = lines[0]?.startsWith('#!') ? 1 : 0;
	while (lines[index]?.trim() === '') index += 1;
	const comments = [];
	while (index < lines.length) {
		const match = lines[index].match(/^[ \t]*#(?: ?)(.*)$/);
		if (!match) break;
		comments.push(match[1]);
		index += 1;
	}
	if (!comments.length) fail(sourcePath, 'expected metadata in a leading shell comment header');
	return dedent(comments.join('\n'));
}

/** @param {string} header @param {string} sourcePath */
function splitFrontmatter(header, sourcePath) {
	const lines = header.split('\n');
	while (lines[0]?.trim() === '') lines.shift();
	if (lines[0]?.trim() !== '---') fail(sourcePath, 'frontmatter must start with `---`');
	const closing = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
	if (closing === -1) fail(sourcePath, 'frontmatter is missing its closing `---` delimiter');
	const yaml = lines.slice(1, closing).join('\n');
	const documentation = lines
		.slice(closing + 1)
		.join('\n')
		.trim();
	return { yaml, documentation };
}

/** @param {string} yaml @param {string} sourcePath @returns {ScriptMetadata} */
function parseFrontmatter(yaml, sourcePath) {
	const document = parseDocument(yaml, {
		schema: 'failsafe',
		strict: true,
		uniqueKeys: true
	});
	if (document.errors.length) {
		fail(
			sourcePath,
			`malformed frontmatter: ${document.errors.map((error) => error.message).join('; ')}`
		);
	}
	const metadata = document.toJS({ maxAliasCount: 0 });
	if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
		fail(sourcePath, 'frontmatter must be a YAML mapping');
	}
	for (const field of Object.keys(metadata)) {
		if (!ALLOWED_FIELDS.has(field)) fail(sourcePath, `unknown metadata field \`${field}\``);
	}
	for (const field of REQUIRED_FIELDS) {
		if (!(field in metadata)) fail(sourcePath, `missing required metadata field \`${field}\``);
	}
	for (const field of ['name', 'description', 'category']) {
		if (typeof metadata[field] !== 'string' || !metadata[field].trim()) {
			fail(sourcePath, `metadata field \`${field}\` must be a non-empty string`);
		}
	}
	if (
		!Array.isArray(metadata.platforms) ||
		metadata.platforms.length === 0 ||
		/** @type {unknown[]} */ (metadata.platforms).some(
			(value) => typeof value !== 'string' || !value.trim()
		)
	) {
		fail(sourcePath, 'metadata field `platforms` must be a non-empty list of strings');
	}
	if (
		metadata.tags !== undefined &&
		(!Array.isArray(metadata.tags) ||
			/** @type {unknown[]} */ (metadata.tags).some(
				(value) => typeof value !== 'string' || !value.trim()
			))
	) {
		fail(sourcePath, 'metadata field `tags` must be a list of strings');
	}
	if (typeof metadata.risk !== 'string' || !RISK_VALUES.has(metadata.risk)) {
		fail(
			sourcePath,
			'metadata field `risk` must be one of: read-only, writes-files, system-changes'
		);
	}
	return {
		name: metadata.name.trim(),
		description: metadata.description.trim(),
		category: metadata.category.trim(),
		platforms: /** @type {string[]} */ (metadata.platforms).map((value) => value.trim()),
		tags: /** @type {string[]} */ (metadata.tags ?? []).map((value) => value.trim()),
		risk: metadata.risk
	};
}

/** @param {string} markdown */
export function renderMarkdown(markdown) {
	const rendered = marked.parse(markdown, { async: false, gfm: true });
	return sanitizeHtml(rendered, {
		allowedTags: [
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'p',
			'ul',
			'ol',
			'li',
			'a',
			'strong',
			'em',
			'del',
			'blockquote',
			'pre',
			'code',
			'table',
			'thead',
			'tbody',
			'tr',
			'th',
			'td',
			'hr',
			'br'
		],
		allowedAttributes: {
			a: ['href', 'title'],
			code: ['class']
		},
		allowedSchemes: ['http', 'https', 'mailto'],
		allowProtocolRelative: false
	});
}

/** @param {string} documentation */
export function extractUsageExamples(documentation) {
	const lines = documentation.replace(/\r\n?/g, '\n').split('\n');
	const start = lines.findIndex((line) => /^#{1,6}\s+usage\s*#*\s*$/i.test(line));
	if (start === -1) return [];
	const level = lines[start].match(/^#+/)?.[0].length ?? 6;
	let end = lines.length;
	for (let index = start + 1; index < lines.length; index += 1) {
		const heading = lines[index].match(/^(#{1,6})\s+/);
		if (heading && heading[1].length <= level) {
			end = index;
			break;
		}
	}
	const section = lines
		.slice(start + 1, end)
		.join('\n')
		.trim();
	const fenced = [];
	const fencePattern = /(?:^|\n)(`{3,}|~{3,})[^\n]*\n([\s\S]*?)\n\1(?=\n|$)/g;
	for (const match of section.matchAll(fencePattern)) fenced.push(match[2].trim());
	if (fenced.length) return fenced.filter(Boolean);
	return section
		.split(/\n\s*\n/)
		.map((example) => example.trim())
		.filter(Boolean);
}

/** @param {string} path */
function encodePath(path) {
	return path.split('/').map(encodeURIComponent).join('/');
}

/**
 * @param {{ source: string, relativePath: string }} input
 * @returns {ScriptRecord}
 */
export function parseScriptMetadata({ source, relativePath }) {
	const extension = extname(relativePath);
	if (extension !== '.py' && extension !== '.sh') {
		fail(relativePath, 'only .py and .sh scripts are supported');
	}
	const header =
		extension === '.py' ? pythonHeader(source, relativePath) : shellHeader(source, relativePath);
	const { yaml, documentation } = splitFrontmatter(header, relativePath);
	const metadata = parseFrontmatter(yaml, relativePath);
	const slug = relativePath.slice(0, -extension.length);
	return {
		slug,
		sourcePath: relativePath,
		language: extension === '.py' ? 'python' : 'shell',
		...metadata,
		usageExamples: extractUsageExamples(documentation),
		downloadUrl: `/${encodePath(relativePath)}`
	};
}

/** @param {Array<Pick<ScriptRecord, 'slug' | 'sourcePath'>>} records */
export function validateUniqueSlugs(records) {
	const paths = new Map();
	for (const record of records) {
		const existing = paths.get(record.slug);
		if (existing) {
			throw new Error(
				`Duplicate script slug \`${record.slug}\` from \`${existing}\` and \`${record.sourcePath}\``
			);
		}
		paths.set(record.slug, record.sourcePath);
	}
}

/** @param {ScriptRecord[]} records */
export function registrySource(records) {
	const serialized = JSON.stringify(records, null, '\t');
	return `// Generated by tools/static-assets.mjs. Do not edit.\nimport type { ScriptRecord } from '../scripts.js';\n\nexport const scripts: readonly ScriptRecord[] = ${serialized};\n\nexport const scriptsBySlug: Readonly<Record<string, ScriptRecord>> = Object.fromEntries(\n\tscripts.map((script) => [script.slug, script])\n);\n`;
}

/** @param {ScriptRecord[]} records @param {{ root?: string }} [options] */
export async function writeScriptRegistry(records, { root = process.cwd() } = {}) {
	validateUniqueSlugs(records);
	const target = resolve(root, 'src/lib/generated/scripts.ts');
	const temporary = `${target}.${process.pid}.tmp`;
	await mkdir(dirname(target), { recursive: true });
	try {
		await writeFile(temporary, registrySource(records));
		await rename(temporary, target);
	} finally {
		await rm(temporary, { force: true });
	}
	return target;
}
