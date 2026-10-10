<script lang="ts">
	import { asset } from '$app/paths';
	import { filterScripts, groupScripts, scriptCommand } from '#lib/catalogue.js';
	import { scripts } from '#lib/generated/scripts.js';
	import type { ScriptRecord } from '#lib/scripts.js';

	type CopyState = { kind: 'success' | 'error'; message: string };

	let query = $state('');
	let searchInput = $state<HTMLInputElement>();
	let copyStates = $state<Record<string, CopyState>>({});
	const orderedScripts = groupScripts(scripts).flatMap((group) => group.scripts);
	const visibleScripts = $derived(filterScripts(orderedScripts, query));

	const riskLabels = {
		'read-only': 'read only',
		'writes-files': 'writes files',
		'system-changes': 'system changes'
	} as const;

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

<div
	class="mx-auto w-[calc(100%-3rem)] max-w-[80rem] pt-8 pb-12 max-[900px]:w-[calc(100%-2.25rem)] max-[900px]:pt-4"
>
	<header
		class="flex min-h-12 items-center justify-between border-b border-surface-1 max-[900px]:items-start max-[900px]:gap-3"
	>
		<a
			class="inline-flex min-h-11 items-center gap-3 font-semibold tracking-[-0.02em] text-text no-underline hover:text-primary-mauve"
			href="https://iktrnch.dev"
		>
			<span>s.iktrnch.dev</span>
			<span
				class="font-mono text-xs leading-[1.4] font-normal tracking-normal text-overlay-1 max-[900px]:hidden"
			>
				/ public scripts
			</span>
		</a>
		<nav class="flex gap-7 font-mono text-xs leading-[1.4] max-[900px]:gap-4" aria-label="Primary">
			<a
				class="inline-flex min-h-11 items-center text-subtext-1 no-underline hover:text-primary-mauve"
				href="https://iktrnch.dev"
			>
				iktrnch.dev
			</a>
		</nav>
	</header>

	<main class="mx-auto w-full max-w-[70rem]">
		<section
			class="grid grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] items-end gap-[clamp(3rem,8vw,7rem)] pt-[clamp(4rem,9vw,7.5rem)] pb-[clamp(3rem,6vw,4.75rem)] max-[900px]:grid-cols-1 max-[900px]:gap-7 max-[900px]:py-12"
			aria-labelledby="page-title"
		>
			<h1
				class="m-0 max-w-[13ch] text-[clamp(2.8rem,5.2vw,4.75rem)] leading-[0.99] font-semibold tracking-[-0.038em] text-balance"
				id="page-title"
			>
				Small scripts,<br /><span class="text-primary-mauve">ready to inspect.</span>
			</h1>
			<div class="max-w-[31rem]">
				<p class="m-0 leading-[1.65] text-subtext-1">
					Copy-ready utilities with their platform support, risk, documentation, and exact source in
					view.
				</p>
				<p class="mt-5 mb-0 leading-[1.55] text-base text-overlay-1">
					Remote scripts execute code. Review the source before running a command.
				</p>
			</div>
		</section>

		<section id="catalogue" class="scroll-mt-4" aria-label="Scripts">
			{#if scripts.length > 0}
				<div
					class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[0.9rem] border-b border-surface-1 pb-[0.8rem]"
					role="search"
				>
					<svg
						class="size-[1.1rem] stroke-overlay-1 stroke-[1.7]"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
					>
						<circle cx="11" cy="11" r="7" />
						<path d="m16.2 16.2 4 4" />
					</svg>
					<label class="sr-only" for="script-search">Search scripts</label>
					<input
						class="min-h-11 w-full border-0 bg-transparent tracking-[-0.01em] text-text placeholder:text-overlay-1 focus-visible:outline-offset-[0.55rem]"
						bind:this={searchInput}
						bind:value={query}
						id="script-search"
						type="search"
						placeholder="Search scripts…"
						autocomplete="off"
					/>
					{#if query}
						<button
							class="min-h-11 cursor-pointer border-0 bg-transparent text-overlay-1 underline underline-offset-4 hover:text-primary-mauve"
							type="button"
							onclick={() => (query = '')}
						>
							Clear
						</button>
					{:else}
						<span class="font-mono text-xs leading-[1.4] text-overlay-1" aria-hidden="true">/</span>
					{/if}
				</div>
			{/if}

			<p class="sr-only" aria-live="polite">
				{visibleScripts.length}
				{visibleScripts.length === 1 ? 'script' : 'scripts'}
			</p>

			{#if scripts.length === 0}
				<div class="border-b border-surface-1 py-[clamp(3rem,8vw,6rem)]">
					<h3 class="m-0 text-[clamp(1.35rem,2.3vw,1.85rem)] tracking-[-0.022em]">
						No scripts published yet.
					</h3>
					<p class="mt-3 mb-0 max-w-[60ch] leading-[1.65] text-subtext-1">
						New scripts appear here automatically when they are added to the registry.
					</p>
				</div>
			{:else if visibleScripts.length === 0}
				<div class="border-b border-surface-1 py-[clamp(3rem,8vw,6rem)]">
					<h3 class="m-0 text-[clamp(1.35rem,2.3vw,1.85rem)] tracking-[-0.022em]">
						No scripts match “{query}”.
					</h3>
					<p class="mt-3 mb-0 max-w-[60ch] leading-[1.65] text-subtext-1">
						Try a name, platform, category, or task such as “documentation”.
					</p>
					<button
						class="min-h-11 cursor-pointer border-0 bg-transparent text-subtext-1 underline underline-offset-4 hover:text-primary-mauve"
						type="button"
						onclick={() => (query = '')}
					>
						Clear search
					</button>
				</div>
			{:else}
				{#each visibleScripts as script (script.slug)}
					<article
						class="grid grid-cols-1 items-start gap-x-8 gap-y-5 border-t border-surface-0 py-6 pb-7 min-[901px]:grid-cols-[minmax(0,1fr)_14rem]"
					>
						<div>
							<h4
								class="m-0 text-[clamp(1.35rem,2.3vw,1.85rem)] leading-[1.15] font-semibold tracking-[-0.022em]"
							>
								{script.name}
							</h4>
							<p class="mt-[0.65rem] mb-0 max-w-[60ch] leading-[1.6] text-subtext-1">
								{script.description}
							</p>
						</div>
						<div
							class="flex flex-row flex-wrap gap-x-3 gap-y-[0.35rem] font-mono text-xs leading-[1.4] text-overlay-1 min-[901px]:flex-col min-[901px]:gap-[0.15rem]"
						>
							<span>{script.language}</span>
							<span>{script.platforms.join(' · ')}</span>
							<span class:text-status-yellow={script.risk === 'system-changes'}>
								{riskLabels[script.risk]}
							</span>
						</div>

						<div
							class="grid grid-cols-1 min-[601px]:grid-cols-[minmax(0,1fr)_13rem_9rem] min-[901px]:col-span-2"
						>
							<div
								class="overflow-hidden rounded-t-sm border border-surface-1 bg-crust min-[601px]:rounded-l-sm min-[601px]:rounded-r-none"
							>
								<code
									class="flex min-w-0 items-center gap-3 overflow-x-auto px-4 py-[0.8rem] font-mono text-xs leading-[1.4] whitespace-nowrap text-text"
								>
									<span class="text-primary-mauve" aria-hidden="true">$</span>
									{scriptCommand(script)}
								</code>
							</div>
							<button
								class="min-h-11 cursor-pointer border border-y-0 border-primary-mauve bg-primary-mauve px-3 font-semibold text-crust hover:border-focus-pink hover:bg-focus-pink min-[601px]:border-y min-[601px]:border-l-0"
								type="button"
								onclick={() => copyCommand(script)}
							>
								<span class:text-xs={copyStates[script.slug]?.kind === 'error'} aria-live="polite">
									{copyStates[script.slug]?.message ?? 'Copy command'}
								</span>
							</button>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a
								class="inline-flex min-h-11 items-center justify-center rounded-b-sm border border-surface-1 bg-transparent px-3 font-semibold text-subtext-1 no-underline hover:border-primary-mauve hover:text-primary-mauve min-[601px]:rounded-l-none min-[601px]:rounded-r-sm min-[601px]:border-l-0"
								href={asset(script.downloadUrl.slice(1) as Parameters<typeof asset>[0])}
							>
								View raw
							</a>
						</div>
					</article>
				{/each}
			{/if}
		</section>
	</main>
</div>
