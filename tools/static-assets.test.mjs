import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import { buildStaticAssets, contentTypeForPath } from './static-assets.mjs';

const temporaryDirectories = [];

afterEach(async () => {
	await Promise.all(
		temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true }))
	);
});

async function fixture() {
	const root = await mkdtemp(join(tmpdir(), 'static-assets-'));
	temporaryDirectories.push(root);
	await mkdir(join(root, 'scripts', 'linux', 'nested'), { recursive: true });
	await mkdir(join(root, 'templates', 'service', 'config'), { recursive: true });
	await mkdir(join(root, 'static'), { recursive: true });
	const shell = Buffer.from(`#!/bin/sh
# ---
# name: Setup
# description: Configures the fixture.
# category: Tests
# platforms: [linux]
# risk: system-changes
# ---
#
# # Setup
#
# ## Usage
#
# ./setup.sh
printf 'fixture\\n'
`);
	const python = Buffer.from(`"""
---
name: Probe
description: Reads fixture state.
category: Tests
platforms: [linux, macos]
tags: [probe]
risk: read-only
---

# Probe

## Usage

python probe.py
"""

print("fixture")
`);
	await writeFile(join(root, 'scripts', 'linux', 'setup.sh'), shell, { mode: 0o755 });
	await writeFile(join(root, 'scripts', 'linux', 'nested', 'probe.py'), python);
	await writeFile(join(root, 'scripts', 'linux', 'notes.txt'), 'not published');
	await writeFile(
		join(root, 'templates', 'service', 'config', 'app.ini'),
		Buffer.from('name=test\r\n')
	);
	await writeFile(join(root, 'templates', 'service', 'README'), Buffer.from([0x00, 0xff, 0x7f]));
	return { root, shell, python };
}

function unzipStored(buffer) {
	const files = new Map();
	let offset = 0;
	while (buffer.readUInt32LE(offset) === 0x04034b50) {
		const size = buffer.readUInt32LE(offset + 18);
		const nameLength = buffer.readUInt16LE(offset + 26);
		const extraLength = buffer.readUInt16LE(offset + 28);
		const nameStart = offset + 30;
		const dataStart = nameStart + nameLength + extraLength;
		files.set(
			buffer.subarray(nameStart, nameStart + nameLength).toString(),
			buffer.subarray(dataStart, dataStart + size)
		);
		offset = dataStart + size;
	}
	return files;
}

async function readStaticUrl(root, url) {
	const pathname = new URL(url, 'http://localhost').pathname;
	return {
		body: await readFile(join(root, 'static', pathname)),
		contentType: contentTypeForPath(pathname)
	};
}

test('publishes nested scripts byte-for-byte at static URLs', async () => {
	const { root, shell, python } = await fixture();
	await buildStaticAssets({ root });
	assert.deepEqual(await readFile(join(root, 'static/script/linux/setup.sh')), shell);
	assert.deepEqual(await readFile(join(root, 'static/script/linux/nested/probe.py')), python);
	await assert.rejects(readFile(join(root, 'static/script/linux/notes.txt')), { code: 'ENOENT' });

	const shellResponse = await readStaticUrl(root, '/script/linux/setup.sh');
	assert.equal(shellResponse.contentType, 'application/x-sh; charset=utf-8');
	assert.deepEqual(shellResponse.body, shell);
	const pythonResponse = await readStaticUrl(root, '/script/linux/nested/probe.py');
	assert.equal(pythonResponse.contentType, 'text/x-python; charset=utf-8');
	assert.deepEqual(pythonResponse.body, python);
	const registry = await readFile(join(root, 'src/lib/generated/scripts.ts'), 'utf8');
	assert.match(registry, /"slug": "linux\/nested\/probe"/);
	assert.match(registry, /"downloadUrl": "\/script\/linux\/nested\/probe\.py"/);
	assert.match(registry, /"documentationUrl": "\/scripts\/linux\/nested\/probe\/"/);
});

test('creates deterministic ZIPs with paths relative to each template', async () => {
	const { root } = await fixture();
	await buildStaticAssets({ root });
	const first = await readFile(join(root, 'static/templates/service.zip'));
	const files = unzipStored(first);
	assert.deepEqual([...files.keys()], ['README', 'config/', 'config/app.ini']);
	assert.deepEqual(files.get('README'), Buffer.from([0x00, 0xff, 0x7f]));
	assert.deepEqual(files.get('config/app.ini'), Buffer.from('name=test\r\n'));
	await buildStaticAssets({ root });
	assert.deepEqual(await readFile(join(root, 'static/templates/service.zip')), first);

	const response = await readStaticUrl(root, '/templates/service.zip');
	assert.equal(response.contentType, 'application/zip');
	assert.deepEqual(response.body, first);
});

test('clean rebuild removes stale generated files without touching other static assets', async () => {
	const { root } = await fixture();
	await buildStaticAssets({ root });
	await writeFile(join(root, 'static/script/stale.py'), 'stale');
	await writeFile(join(root, 'static/templates/stale.zip'), 'stale');
	await writeFile(join(root, 'static/robots.txt'), 'keep');
	await rm(join(root, 'scripts/linux/nested/probe.py'));
	await rm(join(root, 'templates/service'), { recursive: true });
	await buildStaticAssets({ root });
	await assert.rejects(readFile(join(root, 'static/script/stale.py')), { code: 'ENOENT' });
	await assert.rejects(readFile(join(root, 'static/script/linux/nested/probe.py')), {
		code: 'ENOENT'
	});
	await assert.rejects(readFile(join(root, 'static/templates/stale.zip')), { code: 'ENOENT' });
	assert.equal(await readFile(join(root, 'static/robots.txt'), 'utf8'), 'keep');
});
