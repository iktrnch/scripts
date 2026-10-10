import { error } from '@sveltejs/kit';
import { scripts, scriptsBySlug } from '#lib/generated/scripts.js';
import { scriptPrerenderEntries } from '#lib/scripts.js';

export const prerender = true;
export const entries = () => scriptPrerenderEntries(scripts);

export function load({ params }) {
	const script = scriptsBySlug[params.slug.replace(/\/$/, '')];
	if (!script) error(404, 'Script not found');
	return { script };
}
