<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const rawAssetPath = $derived(data.script.downloadUrl.slice(1) as Parameters<typeof asset>[0]);

	const riskLabels = {
		'read-only': 'Read only',
		'writes-files': 'Writes files',
		'system-changes': 'System changes'
	} as const;
</script>

<svelte:head>
	<title>{data.script.name} — s.iktrnch.dev</title>
	<meta name="description" content={data.script.description} />
</svelte:head>

<main class="script-page">
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href={resolve('/')}>s.iktrnch.dev</a>
		<span aria-hidden="true">/</span>
		<span>scripts</span>
		<span aria-hidden="true">/</span>
		<span>{data.script.slug}</span>
	</nav>

	<header class="script-header">
		<h1>{data.script.name}</h1>
		<p>{data.script.description}</p>
	</header>

	<section class="script-ledger" aria-label="Script details">
		<dl>
			<div>
				<dt>Platform</dt>
				<dd>{data.script.platforms.join(' · ')}</dd>
			</div>
			<div>
				<dt>Risk</dt>
				<dd class:risk-system={data.script.risk === 'system-changes'}>
					{riskLabels[data.script.risk]}
				</dd>
			</div>
			<div>
				<dt>Category</dt>
				<dd>{data.script.category}</dd>
			</div>
		</dl>
		<a class="raw-link" href={asset(rawAssetPath)}>View raw {data.script.sourcePath}</a>
	</section>

	{#if !data.script.usageExamples.length}
		<section class="usage" aria-labelledby="usage-heading">
			<h2 id="usage-heading">Usage</h2>
			<p>No standalone usage example was provided. See the documentation below.</p>
		</section>
	{/if}

	<article class="documentation">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.script.documentationHtml}
	</article>
</main>

<style>
	:global(:root) {
		color-scheme: dark;
	}

	:global(body) {
		margin: 0;
		background: #1e1e2e;
		color: #cdd6f4;
		font-family: Onest, ui-sans-serif, system-ui, sans-serif;
	}

	:global(::selection) {
		background: #cba6f7;
		color: #11111b;
	}

	:global(:focus-visible) {
		outline: 2px solid #f5c2e7;
		outline-offset: 4px;
	}

	.script-page {
		width: min(100% - 3rem, 68rem);
		margin: 0 auto;
		padding: 2rem 0 6rem;
	}

	.breadcrumb {
		display: flex;
		min-height: 2.75rem;
		align-items: center;
		gap: 0.55rem;
		overflow-x: auto;
		color: #9399b2;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.breadcrumb a {
		display: inline-flex;
		min-height: 2.75rem;
		align-items: center;
	}

	a {
		color: #cba6f7;
		text-underline-offset: 0.22em;
	}

	a:hover {
		color: #f5c2e7;
	}

	.script-header {
		max-width: 52rem;
		padding: clamp(3rem, 9vw, 7.5rem) 0 clamp(2.5rem, 6vw, 4.5rem);
	}

	.script-header h1 {
		max-width: 18ch;
		margin: 0;
		font-size: clamp(2.8rem, 5.2vw, 4.75rem);
		font-weight: 600;
		letter-spacing: -0.038em;
		line-height: 0.99;
		text-wrap: balance;
	}

	.script-header p {
		max-width: 62ch;
		margin: 1.5rem 0 0;
		color: #bac2de;
		font-size: 1rem;
		line-height: 1.65;
	}

	.script-ledger {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 2rem;
		align-items: end;
		border-block: 1px solid #45475a;
		padding: 1.25rem 0;
	}

	.script-ledger dl {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.5rem;
		margin: 0;
	}

	.script-ledger dt,
	.script-ledger dd {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.75rem;
		line-height: 1.4;
	}

	.script-ledger dt {
		margin-bottom: 0.35rem;
		color: #9399b2;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.script-ledger dd {
		margin: 0;
		color: #cdd6f4;
	}

	.script-ledger .risk-system {
		color: #f9e2af;
	}

	.raw-link {
		display: inline-flex;
		min-width: 0;
		min-height: 2.75rem;
		align-items: center;
		padding: 0.2rem 0;
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.usage,
	.documentation {
		max-width: 70ch;
	}

	.usage {
		padding-top: clamp(3rem, 7vw, 5rem);
	}

	.usage h2,
	.documentation :global(h2) {
		margin: 0 0 1rem;
		border-top: 1px solid #45475a;
		padding-top: 1.5rem;
		font-size: clamp(1.75rem, 3vw, 2.6rem);
		letter-spacing: -0.028em;
		line-height: 1.1;
	}

	.usage p,
	.documentation :global(p),
	.documentation :global(li) {
		color: #bac2de;
		font-size: 1.02rem;
		line-height: 1.72;
	}

	.documentation :global(pre) {
		overflow-x: auto;
		margin: 1.25rem 0;
		border: 1px solid #45475a;
		border-radius: 0.25rem;
		background: #181825;
		padding: 1rem 1.1rem;
		color: #cdd6f4;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 1rem;
		line-height: 1.65;
	}

	.documentation {
		padding-top: 3rem;
	}

	.documentation :global(h1) {
		margin: 0 0 1.5rem;
		font-size: clamp(1.75rem, 3vw, 2.6rem);
		letter-spacing: -0.03em;
		line-height: 1.08;
	}

	.documentation :global(h2) {
		margin-top: 4rem;
	}

	.documentation :global(h3) {
		margin: 2.75rem 0 0.8rem;
		font-size: 1.35rem;
		letter-spacing: -0.022em;
	}

	.documentation :global(ul),
	.documentation :global(ol) {
		padding-left: 1.4rem;
	}

	.documentation :global(li::marker) {
		color: #cba6f7;
	}

	.documentation :global(code:not(pre code)) {
		border-radius: 0.2rem;
		background: #313244;
		padding: 0.12em 0.34em;
		color: #f5c2e7;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.9em;
	}

	.documentation :global(blockquote) {
		margin: 2rem 0;
		border-left: 1px solid #b99bea;
		padding-left: 1.25rem;
	}

	.documentation :global(table) {
		display: block;
		width: max-content;
		max-width: 100%;
		overflow-x: auto;
		border-collapse: collapse;
	}

	.documentation :global(th),
	.documentation :global(td) {
		border-bottom: 1px solid #45475a;
		padding: 0.75rem 1.25rem 0.75rem 0;
		text-align: left;
	}

	.documentation :global(th) {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.75rem;
		font-weight: 500;
	}

	@media (max-width: 760px) {
		.script-page {
			width: min(100% - 2.25rem, 68rem);
			padding-top: 1rem;
		}

		.script-header {
			padding-top: 3.5rem;
		}

		.script-ledger {
			grid-template-columns: 1fr;
			align-items: start;
		}

		.script-ledger dl {
			grid-template-columns: 1fr 1fr;
		}

		.script-ledger dl > :last-child {
			grid-column: 1 / -1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(*) {
			scroll-behavior: auto !important;
		}
	}
</style>
