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

<main
	class="mx-auto w-[calc(100%-3rem)] max-w-[68rem] pt-8 pb-24 max-[760px]:w-[calc(100%-2.25rem)] max-[760px]:pt-4"
>
	<nav
		class="flex min-h-11 items-center gap-[0.55rem] overflow-x-auto font-mono text-xs leading-[1.4] whitespace-nowrap text-overlay-1"
		aria-label="Breadcrumb"
	>
		<a
			class="inline-flex min-h-11 items-center text-primary-mauve underline-offset-[0.22em] hover:text-focus-pink"
			href={resolve('/')}
		>
			s.iktrnch.dev
		</a>
		<span aria-hidden="true">/</span>
		<span>scripts</span>
		<span aria-hidden="true">/</span>
		<span>{data.script.slug}</span>
	</nav>

	<header
		class="max-w-[52rem] pt-[clamp(3rem,9vw,7.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)] max-[760px]:pt-14"
	>
		<h1
			class="m-0 max-w-[18ch] text-[clamp(2.8rem,5.2vw,4.75rem)] leading-[0.99] font-semibold tracking-[-0.038em] text-balance"
		>
			{data.script.name}
		</h1>
		<p class="mt-6 mb-0 max-w-[62ch] leading-[1.65] text-base text-subtext-1">
			{data.script.description}
		</p>
	</header>

	<section
		class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 border-y border-surface-1 py-5 max-[760px]:grid-cols-1 max-[760px]:items-start"
		aria-label="Script details"
	>
		<dl class="m-0 grid grid-cols-3 gap-6 max-[760px]:grid-cols-2">
			<div>
				<dt
					class="mb-[0.35rem] font-mono text-xs leading-[1.4] tracking-[0.06em] text-overlay-1 uppercase"
				>
					Platform
				</dt>
				<dd class="m-0 font-mono text-xs leading-[1.4] text-text">
					{data.script.platforms.join(' · ')}
				</dd>
			</div>
			<div>
				<dt
					class="mb-[0.35rem] font-mono text-xs leading-[1.4] tracking-[0.06em] text-overlay-1 uppercase"
				>
					Risk
				</dt>
				<dd
					class="m-0 font-mono text-xs leading-[1.4] text-text"
					class:text-status-yellow={data.script.risk === 'system-changes'}
				>
					{riskLabels[data.script.risk]}
				</dd>
			</div>
			<div class="max-[760px]:col-span-full">
				<dt
					class="mb-[0.35rem] font-mono text-xs leading-[1.4] tracking-[0.06em] text-overlay-1 uppercase"
				>
					Category
				</dt>
				<dd class="m-0 font-mono text-xs leading-[1.4] text-text">{data.script.category}</dd>
			</div>
		</dl>
		<a
			class="inline-flex min-h-11 min-w-0 items-center py-[0.2rem] font-semibold [overflow-wrap:anywhere] text-primary-mauve underline-offset-[0.22em] hover:text-focus-pink"
			href={asset(rawAssetPath)}
		>
			View raw {data.script.sourcePath}
		</a>
	</section>

	{#if !data.script.usageExamples.length}
		<section class="max-w-[70ch] pt-[clamp(3rem,7vw,5rem)]" aria-labelledby="usage-heading">
			<h2
				class="mt-0 mb-4 border-t border-surface-1 pt-6 text-[clamp(1.75rem,3vw,2.6rem)] leading-[1.1] tracking-[-0.028em]"
				id="usage-heading"
			>
				Usage
			</h2>
			<p class="text-[1.02rem] leading-[1.72] text-subtext-1">
				No standalone usage example was provided. See the documentation below.
			</p>
		</section>
	{/if}

	<article
		class="max-w-[70ch] pt-12
		[&_a]:text-primary-mauve [&_a]:underline-offset-[0.22em] [&_a:hover]:text-focus-pink
		[&_blockquote]:my-8 [&_blockquote]:border-l [&_blockquote]:border-primary-mauve-soft [&_blockquote]:pl-5
		[&_code:not(pre_code)]:rounded-[0.2rem] [&_code:not(pre_code)]:bg-surface-0 [&_code:not(pre_code)]:px-[0.34em] [&_code:not(pre_code)]:py-[0.12em] [&_code:not(pre_code)]:font-mono [&_code:not(pre_code)]:text-[0.9em] [&_code:not(pre_code)]:text-focus-pink
		[&_h1]:mt-0 [&_h1]:mb-6 [&_h1]:text-[clamp(1.75rem,3vw,2.6rem)] [&_h1]:leading-[1.08] [&_h1]:tracking-[-0.03em]
		[&_h2]:mt-16 [&_h2]:mb-4 [&_h2]:border-t [&_h2]:border-surface-1 [&_h2]:pt-6 [&_h2]:text-[clamp(1.75rem,3vw,2.6rem)] [&_h2]:leading-[1.1] [&_h2]:tracking-[-0.028em]
		[&_h3]:mt-11 [&_h3]:mb-[0.8rem] [&_h3]:text-[1.35rem] [&_h3]:tracking-[-0.022em]
		[&_li]:text-[1.02rem] [&_li]:leading-[1.72] [&_li]:text-subtext-1 [&_li::marker]:text-primary-mauve
		[&_ol]:pl-[1.4rem]
		[&_p]:text-[1.02rem] [&_p]:leading-[1.72] [&_p]:text-subtext-1
		[&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-sm [&_pre]:border [&_pre]:border-surface-1 [&_pre]:bg-mantle [&_pre]:px-[1.1rem] [&_pre]:py-4 [&_pre]:font-mono [&_pre]:leading-[1.65] [&_pre]:text-base [&_pre]:text-text
		[&_table]:block [&_table]:w-max [&_table]:max-w-full [&_table]:border-collapse [&_table]:overflow-x-auto
		[&_td]:border-b [&_td]:border-surface-1 [&_td]:py-3 [&_td]:pr-5 [&_td]:text-left
		[&_th]:border-b [&_th]:border-surface-1 [&_th]:py-3 [&_th]:pr-5 [&_th]:text-left [&_th]:font-mono [&_th]:text-xs [&_th]:font-medium
		[&_ul]:pl-[1.4rem]"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.script.documentationHtml}
	</article>
</main>
