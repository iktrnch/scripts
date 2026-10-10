import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scriptPrerenderEntries } from '../src/lib/scripts.ts';
import {
	extractUsageExamples,
	parseScriptMetadata,
	registrySource,
	renderMarkdown,
	validateUniqueSlugs
} from './script-metadata.mjs';

const frontmatter = `---
name: Documentation Index Generator
description: Generates a flat Markdown documentation index.
category: Documentation
platforms: [linux, macos, windows]
tags: [markdown, docs]
risk: writes-files
---`;

test('parses Python module docstring metadata and documentation', () => {
	const record = parseScriptMetadata({
		relativePath: 'docs/gen_index.py',
		source: `#!/usr/bin/env python3
"""
${frontmatter}

# Documentation Index Generator

Generate INDEX.md from a directory.

## Usage

uv run https://s.iktrnch.dev/script/docs/gen_index.py ./docs
"""
`
	});
	assert.equal(record.slug, 'docs/gen_index');
	assert.equal(record.language, 'python');
	assert.deepEqual(record.platforms, ['linux', 'macos', 'windows']);
	assert.deepEqual(record.tags, ['markdown', 'docs']);
	assert.deepEqual(record.usageExamples, [
		'uv run https://s.iktrnch.dev/script/docs/gen_index.py ./docs'
	]);
	assert.equal(record.downloadUrl, '/script/docs/gen_index.py');
	assert.equal(record.documentationUrl, '/scripts/docs/gen_index/');
	assert.doesNotMatch(record.documentationHtml, /<h1>Documentation Index Generator<\/h1>/);
});

test('parses shell comment metadata and fenced usage examples', () => {
	const record = parseScriptMetadata({
		relativePath: 'linux/setup_arch.sh',
		source: `#!/bin/sh
# ${frontmatter.split('\n').join('\n# ')}
#
# # Arch setup
#
# ## Usage
#
# \`\`\`sh
# ./setup_arch.sh --dry-run
# \`\`\`
set -eu
`
	});
	assert.equal(record.slug, 'linux/setup_arch');
	assert.equal(record.language, 'shell');
	assert.deepEqual(record.usageExamples, ['./setup_arch.sh --dry-run']);
});

test('reports malformed and invalid metadata with the script path', () => {
	assert.throws(
		() =>
			parseScriptMetadata({
				relativePath: 'broken.py',
				source: `"""\n---\nname: Broken\nplatforms: linux\nrisk: dangerous\n---\n"""`
			}),
		/broken\.py: missing required metadata field `description`/
	);
	assert.throws(
		() =>
			parseScriptMetadata({
				relativePath: 'broken.sh',
				source: '# ---\n# name: [unterminated\n# ---\n'
			}),
		/broken\.sh: malformed frontmatter/
	);
	assert.throws(
		() =>
			parseScriptMetadata({
				relativePath: 'risk.py',
				source: `"""\n${frontmatter.replace('writes-files', 'dangerous')}\n"""`
			}),
		/metadata field `risk` must be one of/
	);
});

test('rejects duplicate nested slugs with actionable source paths', () => {
	assert.throws(
		() =>
			validateUniqueSlugs([
				{ slug: 'linux/setup', sourcePath: 'linux/setup.py' },
				{ slug: 'linux/setup', sourcePath: 'linux/setup.sh' }
			]),
		/Duplicate script slug `linux\/setup` from `linux\/setup\.py` and `linux\/setup\.sh`/
	);
});

test('renders supported Markdown while removing executable HTML and unsafe links', () => {
	const html = renderMarkdown(`# Heading

- one
- two

| Name | Value |
| --- | --- |
| safe | yes |

\`\`\`sh
echo safe
\`\`\`

<script>alert('no')</script>

[unsafe](javascript:alert('no'))
`);
	assert.match(html, /<h1>Heading<\/h1>/);
	assert.match(html, /<table>/);
	assert.match(html, /<pre><code class="language-sh">echo safe/);
	assert.doesNotMatch(html, /<script|javascript:/);
});

test('generates a typed registry with nested prerender URLs and documentation', () => {
	const record = parseScriptMetadata({
		relativePath: 'nested/tool.py',
		source: `"""\n${frontmatter}\n\n## Usage\n\npython tool.py\n"""`
	});
	const generated = registrySource([record]);
	assert.match(generated, /import type \{ ScriptRecord \}/);
	assert.match(generated, /export const scripts: readonly ScriptRecord\[\]/);
	assert.match(generated, /"documentationUrl": "\/scripts\/nested\/tool\/"/);
	assert.match(generated, /"documentationHtml": "<h2>Usage<\/h2>/);
	assert.deepEqual(extractUsageExamples(record.documentation), ['python tool.py']);
	assert.deepEqual(scriptPrerenderEntries([record]), [{ slug: 'nested/tool' }]);
});
