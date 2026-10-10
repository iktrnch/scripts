<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { filterScripts, groupScripts, scriptCommand } from '#lib/catalogue.js';
	import { scripts } from '#lib/generated/scripts.js';
	import type { ScriptRecord } from '#lib/scripts.js';

	type CopyState = { kind: 'success' | 'error'; message: string };

	let query = $state('');
	let searchInput: HTMLInputElement;
	let copyStates = $state<Record<string, CopyState>>({});
	const orderedScripts = groupScripts(scripts).flatMap((group) => group.scripts);
	const featured = orderedScripts[0];
	const visibleScripts = $derived(filterScripts(scripts, query));
	const visibleGroups = $derived(groupScripts(visibleScripts));

	const riskLabels = {
		'read-only': 'read only',
		'writes-files': 'writes files',
		'system-changes': 'system changes'
	} as const;

	function documentationHref(script: ScriptRecord) {
		return `${resolve('/scripts/[...slug]', { slug: script.slug }).replace(/\/$/, '')}/`;
	}

	async function copyCommand(script: ScriptRecord) {
		try {
			await navigator.clipboard.writeText(scriptCommand(script));
			copyStates[script.slug] = { kind: 'success', message: 'Copied' };
		} catch {
			copyStates[script.slug] = {
				kind: 'error',
				message: 'Copy failed — select the command'
			};
		}
	}

	function handleShortcut(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]');
		if (event.key === '/' && !isTyping) {
			event.preventDefault();
			searchInput?.focus();
		}
		if (event.key === 'Escape' && target === searchInput && query) {
			query = '';
		}
	}
</script>

<svelte:head>
	<title>Public scripts — s.iktrnch.dev</title>
	<meta
		name="description"
		content="Inspect, understand, and copy small public scripts for documentation, system setup, and everyday engineering work."
	/>
	<meta name="theme-color" content="#1e1e2e" />
</svelte:head>

<svelte:window onkeydown={handleShortcut} />

<div class="page-shell">
	<header class="site-header">
		<a class="site-mark" href="https://iktrnch.dev">
			<span>s.iktrnch.dev</span>
			<span class="site-context">/ public scripts</span>
		</a>
		<nav aria-label="Primary">
			<a href="#catalogue">Catalogue</a>
			<a href="https://iktrnch.dev">iktrnch.dev</a>
		</nav>
	</header>

	<main>
		<section class="intro" aria-labelledby="page-title">
			<h1 id="page-title">Small scripts,<br /><span>ready to inspect.</span></h1>
			<div class="intro-copy">
				<p>
					Copy-ready utilities with their documentation, platform support, risk, and exact source
					kept in view before anything runs.
				</p>
				<p class="security-note">
					Remote scripts execute code on your machine. Review the documentation and raw source
					before running a command.
				</p>
			</div>
		</section>

		{#if featured}
			<section class="runway" aria-labelledby="featured-title">
				<div class="runway-heading">
					<h2 id="featured-title">{featured.name}</h2>
					<p>
						{featured.language} <span aria-hidden="true">·</span>
						<span class:system-risk={featured.risk === 'system-changes'}>
							{riskLabels[featured.risk]}
						</span>
					</p>
				</div>
				<div class="command-row">
					<code><span aria-hidden="true">$</span>{scriptCommand(featured)}</code>
					<button type="button" onclick={() => copyCommand(featured)}>
						<span
							class:error-state={copyStates[featured.slug]?.kind === 'error'}
							aria-live="polite"
						>
							{copyStates[featured.slug]?.message ?? 'Copy command'}
						</span>
					</button>
				</div>
				<div class="runway-footer">
					<p>{featured.description}</p>
					<div>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href={documentationHref(featured)}>Documentation</a>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href={asset(featured.downloadUrl.slice(1) as Parameters<typeof asset>[0])}>
							Raw source
						</a>
					</div>
				</div>
			</section>
		{/if}

		<section class="catalogue" id="catalogue" aria-labelledby="catalogue-title">
			<div class="search-row" role="search">
				<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="11" cy="11" r="7" />
					<path d="m16.2 16.2 4 4" />
				</svg>
				<label class="visually-hidden" for="script-search">Search scripts</label>
				<input
					bind:this={searchInput}
					bind:value={query}
					id="script-search"
					type="search"
					placeholder="Search by name, task, category, or platform…"
					autocomplete="off"
				/>
				{#if query}
					<button class="clear-search" type="button" onclick={() => (query = '')}>Clear</button>
				{:else}
					<span class="shortcut" aria-hidden="true">/</span>
				{/if}
			</div>

			<div class="catalogue-heading">
				<h2 id="catalogue-title">Script ledger</h2>
				<p>Grouped by purpose. Every source stays one step away.</p>
				<p class="result-count" aria-live="polite">
					{visibleScripts.length}
					{visibleScripts.length === 1 ? 'script' : 'scripts'}
				</p>
			</div>

			{#if scripts.length === 0}
				<div class="empty-state">
					<h3>The ledger is being prepared.</h3>
					<p>Published scripts will appear here automatically from the generated registry.</p>
				</div>
			{:else if visibleGroups.length === 0}
				<div class="empty-state">
					<h3>No scripts match “{query}”.</h3>
					<p>Try a name, platform, category, or task such as “documentation”.</p>
					<button type="button" onclick={() => (query = '')}>Clear search</button>
				</div>
			{:else}
				{#each visibleGroups as group (group.name)}
					<section class="category" aria-labelledby={`category-${group.name}`}>
						<div class="category-heading">
							<h3 id={`category-${group.name}`}>{group.name}</h3>
							<span>{group.scripts.length}</span>
						</div>

						{#each group.scripts as script (script.slug)}
							<article class="script-entry">
								<div class="entry-summary">
									<div class="entry-meta">
										<span>{script.language}</span>
										<span>{script.category}</span>
										<span>{script.platforms.join(' · ')}</span>
										<span class:system-risk={script.risk === 'system-changes'}>
											{riskLabels[script.risk]}
										</span>
									</div>
									<div>
										<h4>{script.name}</h4>
										<p>{script.description}</p>
									</div>
									<nav aria-label={`${script.name} links`}>
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
										<a href={documentationHref(script)}>Documentation</a>
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
										<a href={asset(script.downloadUrl.slice(1) as Parameters<typeof asset>[0])}>
											Raw source
										</a>
									</nav>
								</div>

								<div class="command-row entry-command">
									<code><span aria-hidden="true">$</span>{scriptCommand(script)}</code>
									<button type="button" onclick={() => copyCommand(script)}>
										<span
											class:error-state={copyStates[script.slug]?.kind === 'error'}
											aria-live="polite"
										>
											{copyStates[script.slug]?.message ?? 'Copy command'}
										</span>
									</button>
								</div>
							</article>
						{/each}
					</section>
				{/each}
			{/if}
		</section>
	</main>

	<footer>
		<p>Static artifacts, generated documentation, no runtime server.</p>
		<a href="https://iktrnch.dev">Made by Illia Katerynych</a>
	</footer>
</div>

<style>
	.page-shell {
		width: min(100% - 3rem, 80rem);
		margin: 0 auto;
		padding: 2rem 0 3rem;
	}

	.site-header {
		display: flex;
		min-height: 3rem;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--surface-1);
	}

	.site-mark {
		display: inline-flex;
		min-height: 2.75rem;
		align-items: center;
		gap: 0.75rem;
		color: var(--text);
		font-weight: 600;
		letter-spacing: -0.02em;
		text-decoration: none;
	}

	.site-context,
	.site-header nav,
	.entry-meta,
	.runway-heading p,
	.result-count,
	.shortcut,
	.category-heading,
	footer {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.75rem;
		line-height: 1.4;
	}

	.site-context {
		color: var(--overlay-1);
		font-weight: 400;
		letter-spacing: 0;
	}

	.site-header nav {
		display: flex;
		gap: 1.75rem;
	}

	.site-header nav a,
	.entry-summary nav a,
	.runway-footer a,
	footer a {
		color: var(--subtext-1);
		text-underline-offset: 0.25em;
	}

	.entry-summary nav a,
	.runway-footer a,
	footer a {
		display: inline-flex;
		min-height: 2.75rem;
		align-items: center;
	}

	.site-header nav a {
		display: inline-flex;
		min-height: 2.75rem;
		align-items: center;
		text-decoration: none;
	}

	.site-header a:hover,
	.entry-summary nav a:hover,
	.runway-footer a:hover,
	footer a:hover {
		color: var(--primary-mauve);
	}

	main {
		width: min(100%, 70rem);
		margin: 0 auto;
	}

	.intro {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
		gap: clamp(3rem, 8vw, 7rem);
		align-items: end;
		padding: clamp(4rem, 9vw, 7.5rem) 0 clamp(3rem, 6vw, 4.75rem);
	}

	h1 {
		max-width: 13ch;
		margin: 0;
		font-size: clamp(2.8rem, 5.2vw, 4.75rem);
		font-weight: 600;
		letter-spacing: -0.038em;
		line-height: 0.99;
		text-wrap: balance;
	}

	h1 span {
		color: var(--primary-mauve);
	}

	.intro-copy {
		max-width: 31rem;
	}

	.intro-copy p {
		margin: 0;
		color: var(--subtext-1);
		line-height: 1.65;
	}

	.intro-copy .security-note {
		margin-top: 1.25rem;
		color: var(--overlay-1);
		font-size: 1rem;
		line-height: 1.55;
	}

	.runway {
		border-block: 1px solid var(--surface-1);
		padding: 1.15rem 0 1.25rem;
	}

	.runway-heading,
	.runway-footer,
	.catalogue-heading,
	.category-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.5rem;
	}

	.runway-heading {
		margin-bottom: 0.75rem;
	}

	.runway-heading h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.4;
	}

	.runway-heading p,
	.runway-footer p {
		margin: 0;
	}

	.runway-heading p {
		color: var(--overlay-1);
	}

	.system-risk {
		color: var(--status-yellow);
	}

	.command-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		border: 1px solid var(--surface-1);
		border-radius: 0.25rem;
		background: var(--crust);
		overflow: hidden;
	}

	.command-row code {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 0.75rem;
		overflow-x: auto;
		padding: 1rem 1.15rem;
		color: var(--text);
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.75rem;
		line-height: 1.4;
		white-space: nowrap;
	}

	.command-row code span {
		color: var(--primary-mauve);
	}

	.command-row button {
		width: 13rem;
		min-width: 13rem;
		border: 0;
		border-left: 1px solid var(--surface-1);
		border-radius: 0;
		background: var(--primary-mauve);
		color: var(--crust);
		font-weight: 600;
		cursor: pointer;
	}

	.command-row button:hover {
		background: var(--focus-pink);
	}

	.command-row button:active {
		transform: translateY(1px);
	}

	.command-row button .error-state {
		color: var(--crust);
		font-size: 0.75rem;
	}

	.runway-footer {
		margin-top: 0.75rem;
		color: var(--overlay-1);
		font-size: 1rem;
	}

	.runway-footer div,
	.entry-summary nav {
		display: flex;
		gap: 1.25rem;
		flex-shrink: 0;
	}

	.catalogue {
		padding-top: 2rem;
		scroll-margin-top: 1rem;
	}

	.search-row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: 0.9rem;
		align-items: center;
		border-bottom: 1px solid var(--surface-1);
		padding-bottom: 0.8rem;
	}

	.search-row svg {
		width: 1.1rem;
		height: 1.1rem;
		stroke: var(--overlay-1);
		stroke-width: 1.7;
	}

	.search-row input {
		width: 100%;
		min-height: 2.75rem;
		border: 0;
		background: transparent;
		color: var(--text);
		font: inherit;
		letter-spacing: -0.01em;
	}

	.search-row input::placeholder {
		color: var(--overlay-1);
		opacity: 1;
	}

	.search-row input:focus-visible {
		outline-offset: 0.55rem;
	}

	.shortcut,
	.clear-search {
		color: var(--overlay-1);
	}

	.clear-search,
	.empty-state button {
		min-height: 2.75rem;
		border: 0;
		background: transparent;
		color: var(--subtext-1);
		font: inherit;
		text-decoration: underline;
		text-underline-offset: 0.25em;
		cursor: pointer;
	}

	.clear-search:hover,
	.empty-state button:hover {
		color: var(--primary-mauve);
	}

	.catalogue-heading {
		padding: 2.25rem 0 0.9rem;
		border-bottom: 1px solid var(--surface-1);
	}

	.catalogue-heading h2 {
		margin: 0;
		font-size: clamp(1.75rem, 3vw, 2.6rem);
		font-weight: 600;
		letter-spacing: -0.028em;
		line-height: 1.1;
	}

	.catalogue-heading > p:not(.result-count) {
		flex: 1;
		margin: 0;
		color: var(--overlay-1);
		font-size: 1rem;
	}

	.result-count {
		margin: 0;
		color: var(--primary-mauve);
		white-space: nowrap;
	}

	.category {
		padding-top: 2rem;
	}

	.category-heading {
		padding-bottom: 0.65rem;
		color: var(--overlay-1);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.category-heading h3 {
		margin: 0;
		font: inherit;
	}

	.category-heading span {
		color: var(--primary-mauve);
	}

	.script-entry {
		border-top: 1px solid var(--surface-0);
		padding: 1.5rem 0 1.75rem;
	}

	.entry-summary {
		display: grid;
		grid-template-columns: 11rem minmax(0, 1fr) auto;
		gap: 2rem;
		align-items: start;
	}

	.entry-meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		color: var(--overlay-1);
	}

	.entry-summary h4 {
		margin: 0;
		font-size: clamp(1.35rem, 2.3vw, 1.85rem);
		font-weight: 600;
		letter-spacing: -0.022em;
		line-height: 1.15;
	}

	.entry-summary p {
		max-width: 60ch;
		margin: 0.65rem 0 0;
		color: var(--subtext-1);
		line-height: 1.6;
	}

	.entry-summary nav {
		font-size: 1rem;
		white-space: nowrap;
	}

	.entry-command {
		margin: 1.25rem 0 0 13rem;
	}

	.empty-state {
		border-bottom: 1px solid var(--surface-1);
		padding: clamp(3rem, 8vw, 6rem) 0;
	}

	.empty-state h3 {
		margin: 0;
		font-size: clamp(1.35rem, 2.3vw, 1.85rem);
		letter-spacing: -0.022em;
	}

	.empty-state p {
		max-width: 60ch;
		margin: 0.75rem 0 0;
		color: var(--subtext-1);
		line-height: 1.65;
	}

	footer {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		margin-top: clamp(5rem, 10vw, 8rem);
		border-top: 1px solid var(--surface-1);
		padding-top: 1.25rem;
		color: var(--overlay-1);
	}

	footer p {
		margin: 0;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 800px) {
		.page-shell {
			width: min(100% - 2.25rem, 80rem);
			padding-top: 1rem;
		}

		.site-header {
			align-items: flex-start;
			gap: 0.75rem;
		}

		.site-context {
			display: none;
		}

		.site-header nav {
			gap: 1rem;
		}

		.intro {
			grid-template-columns: 1fr;
			gap: 1.75rem;
			padding: 4rem 0 3rem;
		}

		.command-row {
			grid-template-columns: minmax(0, 1fr);
		}

		.command-row button {
			width: auto;
			min-height: 3rem;
			border-top: 1px solid var(--surface-1);
			border-left: 0;
		}

		.runway-heading,
		.runway-footer,
		.catalogue-heading,
		footer {
			align-items: flex-start;
			flex-direction: column;
			gap: 0.75rem;
		}

		.runway-footer div {
			width: 100%;
			justify-content: space-between;
		}

		.catalogue-heading > p:not(.result-count) {
			order: 3;
		}

		.entry-summary {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.entry-meta {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 0.35rem 0.75rem;
		}

		.entry-summary nav {
			min-height: 2.75rem;
			align-items: center;
		}

		.entry-command {
			margin-left: 0;
		}
	}

	@media (max-width: 480px) {
		.site-header nav a:first-child {
			display: none;
		}

		.runway-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: 0.35rem;
		}

		.runway-footer div,
		.entry-summary nav {
			flex-wrap: wrap;
		}

		.command-row code {
			padding: 0.9rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.command-row button:active {
			transform: none;
		}
	}
</style>
