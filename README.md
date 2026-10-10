# s.iktrnch.dev

Static downloads for scripts and reusable templates, built with SvelteKit and deployed to Cloudflare Pages.

## Asset pipeline

- Every `.py` and `.sh` file below `scripts/` is copied byte-for-byte to `/<relative-path>`.
- Every immediate directory below `templates/` becomes a deterministic `/templates/<name>.zip`; archive entries are relative to that directory and retain nested paths.
- `bun run dev` and `bun run build` regenerate these files first. Production builds also clear the ignored `build/` output so removed downloads cannot survive a rebuild. During development, changes below either source directory trigger another clean generation and browser reload.
- Generated scripts are written to their ignored root-relative paths in `static/`; a generated manifest removes only stale managed scripts. Template archives remain in `static/templates/`.

Cloudflare Pages should publish the `build/` directory. SvelteKit prerenders the complete site with `adapter-static`; there are no runtime Workers, SSR endpoints, or Pages Functions. `static/_headers` supplies download content types on Pages, and the Vite development/preview servers apply the same types locally.

## Script metadata and documentation

Every published script must begin with YAML-style frontmatter followed by Markdown documentation. Put it in the first Python module docstring or in the leading `#` comment block of a shell script:

```python
"""
---
name: Documentation Index Generator
description: Generates a flat Markdown documentation index.
category: Documentation
platforms: [linux, macos, windows]
tags: [markdown, docs]
risk: writes-files
---

# Documentation Index Generator

## Usage

uv run https://s.iktrnch.dev/gen_index.py ./docs
"""
```

`name`, `description`, `category`, `platforms`, and `risk` are required. `tags` is optional, and `risk` must be `read-only`, `writes-files`, or `system-changes`. Builds fail with the source path when metadata is missing or invalid, or when `.py` and `.sh` files would produce the same extensionless slug.

The asset pass also writes an ignored typed registry to `src/lib/generated/scripts.ts`. Raw scripts are served directly from `/<relative-path>`; there is no per-script documentation route.

## Development

```sh
bun install
bun run dev
```

Run the tests, Svelte diagnostics, and a production build with:

```sh
bun run test
bun run check
bun run build
```

The sections below are the original `sv` project notes.

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@1.1.1 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:none" --install bun .
```

## Adding features

Add features to your project with `sv add`:

```sh
npx sv add
```

For example, to add Tailwind CSS:

```sh
npx sv add tailwindcss
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
