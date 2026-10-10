import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterScripts, groupScripts, scriptCommand } from '../src/lib/catalogue.ts';

const scripts = [
	{
		slug: 'linux/setup',
		sourcePath: 'linux/setup.sh',
		language: 'shell',
		name: 'Setup Linux',
		description: 'Configures a workstation.',
		category: 'System',
		platforms: ['linux'],
		tags: ['setup'],
		risk: 'system-changes',
		usageExamples: [],
		documentation: '',
		documentationHtml: '',
		downloadUrl: '/script/linux/setup.sh',
		documentationUrl: '/scripts/linux/setup/'
	},
	{
		slug: 'docs/index',
		sourcePath: 'docs/index.py',
		language: 'python',
		name: 'Documentation Index',
		description: 'Builds a Markdown index.',
		category: 'Documentation',
		platforms: ['linux', 'macos', 'windows'],
		tags: ['markdown'],
		risk: 'writes-files',
		usageExamples: [],
		documentation: '',
		documentationHtml: '',
		downloadUrl: '/script/docs/index.py',
		documentationUrl: '/scripts/docs/index/'
	}
];

test('creates language-appropriate public execution commands', () => {
	assert.equal(scriptCommand(scripts[1]), 'uv run https://s.iktrnch.dev/script/docs/index.py');
	assert.equal(
		scriptCommand(scripts[0]),
		'curl -fsSL https://s.iktrnch.dev/script/linux/setup.sh | sh'
	);
});

test('groups categories and scripts predictably', () => {
	assert.deepEqual(
		groupScripts(scripts).map((group) => [group.name, group.scripts.map((script) => script.slug)]),
		[
			['Documentation', ['docs/index']],
			['System', ['linux/setup']]
		]
	);
});

test('filters across metadata and commands using every search term', () => {
	assert.deepEqual(
		filterScripts(scripts, 'markdown windows').map((script) => script.slug),
		['docs/index']
	);
	assert.deepEqual(
		filterScripts(scripts, 'shell linux').map((script) => script.slug),
		['linux/setup']
	);
	assert.deepEqual(filterScripts(scripts, 'missing'), []);
});
