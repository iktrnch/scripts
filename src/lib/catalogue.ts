import type { ScriptRecord } from './scripts.js';

export const publicOrigin = 'https://s.iktrnch.dev';

export interface ScriptCategory {
	name: string;
	scripts: readonly ScriptRecord[];
}

export function scriptCommand(script: Pick<ScriptRecord, 'language' | 'downloadUrl'>) {
	const url = `${publicOrigin}${script.downloadUrl}`;
	return script.language === 'python' ? `uv run ${url}` : `curl -fsSL ${url} | sh`;
}

export function groupScripts(records: readonly ScriptRecord[]): ScriptCategory[] {
	const categories = new Map<string, ScriptRecord[]>();
	for (const script of records) {
		const group = categories.get(script.category) ?? [];
		group.push(script);
		categories.set(script.category, group);
	}

	return [...categories]
		.sort(([left], [right]) => left.localeCompare(right, undefined, { sensitivity: 'base' }))
		.map(([name, scripts]) => ({
			name,
			scripts: scripts.toSorted(
				(left, right) =>
					left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }) ||
					left.slug.localeCompare(right.slug)
			)
		}));
}

export function filterScripts(records: readonly ScriptRecord[], query: string) {
	const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
	if (!terms.length) return [...records];

	return records.filter((script) => {
		const searchable = [
			script.name,
			script.description,
			script.category,
			script.language,
			script.risk,
			...script.platforms,
			...script.tags,
			scriptCommand(script)
		]
			.join(' ')
			.toLocaleLowerCase();
		return terms.every((term) => searchable.includes(term));
	});
}
