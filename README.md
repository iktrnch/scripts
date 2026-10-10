<!-- prettier-ignore -->
<div align="center">

<img src="./src/lib/assets/favicon.svg" alt="s.iktrnch.dev logo" width="80" height="80" />

# s.iktrnch.dev

A transparent catalogue of small, copy-ready scripts and reusable templates.

[Browse the catalogue](https://s.iktrnch.dev) · [Add a script](#add-a-script) · [Development](#development)

</div>

Each catalogue entry shows what a script does, which platforms it supports, its risk level, the command needed to run it, and the exact source behind that command. The site is built with SvelteKit, generated entirely at build time, and deployed as static assets on Cloudflare.

> [!CAUTION]
> Remote scripts execute code in your environment. Inspect the linked source and understand its risk level before running a command.

## Available scripts

### Documentation Index Generator

Generates a flat, human-readable `INDEX.md` for a directory of Markdown documentation.

```sh
uv run https://s.iktrnch.dev/gen_index.py ./docs
```

Use `--dry-run` to print the generated Markdown without writing a file, or `--output FILE` to choose another destination.

## How it works

The repository uses `scripts/` and `templates/` as its source directories:

- Python and shell files below `scripts/` are published byte-for-byte at their repository-relative URLs.
- Script frontmatter is validated and compiled into a typed catalogue registry.
- Each immediate directory below `templates/` becomes a deterministic `/templates/<name>.zip` archive.
- Development rebuilds assets when either source directory changes.
- Production builds clear the generated output first, so removed downloads do not survive a rebuild.

The SvelteKit application is fully prerendered with `adapter-static`. There are no runtime handlers, server-side fetches, or Pages Functions. Cloudflare and the local Vite server return explicit content types for Python, shell, and ZIP downloads.

## Add a script

Add a `.py` or `.sh` file anywhere below `scripts/`. Every script must start with YAML frontmatter followed by Markdown documentation:

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

For shell scripts, place the same content in the leading `#` comment block after the optional shebang.

| Field         | Required | Description                                      |
| ------------- | :------: | ------------------------------------------------ |
| `name`        |   Yes    | Human-readable script name                       |
| `description` |   Yes    | Short summary shown in the catalogue             |
| `category`    |   Yes    | Catalogue grouping                               |
| `platforms`   |   Yes    | Non-empty list of supported platforms            |
| `risk`        |   Yes    | `read-only`, `writes-files`, or `system-changes` |
| `tags`        |    No    | Additional search terms                          |

> [!NOTE]
> A Python file and shell file cannot share the same extensionless path. For example, `scripts/setup.py` and `scripts/setup.sh` would both produce the `setup` slug, so the build rejects them.

The asset step generates `src/lib/generated/scripts.ts`; do not edit that file directly. Published scripts are served from `/<relative-path>` with no intermediate `/scripts/` route.

## Add a template

Create a directory directly below `templates/` and place the reusable files inside it:

```text
templates/
└── service/
    ├── README.md
    └── config/
        └── app.ini
```

The next asset pass publishes it as `/templates/service.zip`, retaining its nested paths. Generated archives are ignored by Git and should not be committed.

## Development

Install [Bun](https://bun.sh), then install dependencies and start the local server:

```sh
bun install
bun run dev
```

Useful commands:

| Command           | Purpose                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `bun run assets`  | Regenerate published scripts, template archives, and the typed registry |
| `bun run test`    | Run the asset, metadata, and catalogue tests                            |
| `bun run check`   | Run Svelte and TypeScript diagnostics                                   |
| `bun run lint`    | Check formatting and ESLint rules                                       |
| `bun run format`  | Format the repository                                                   |
| `bun run build`   | Create a clean production build in `build/`                             |
| `bun run preview` | Preview the production build locally                                    |

## Project structure

```text
scripts/                 Published Python and shell sources
templates/               Source directories for generated ZIP archives
src/lib/generated/       Generated script registry
src/routes/              Prerendered catalogue interface
static/                  Static files and generated download assets
tools/                   Asset pipeline, metadata parser, and tests
wrangler.jsonc           Cloudflare Workers Static Assets configuration
```

## Deployment

Build and deploy the static output with Wrangler:

```sh
bun run build
bunx wrangler deploy
```

`wrangler.jsonc` publishes `build/` through Workers Static Assets at the `s.iktrnch.dev` custom domain without a Worker entrypoint.
