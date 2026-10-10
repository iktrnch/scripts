# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and system operators looking for inspectable, copy-ready personal scripts.

## Product Purpose

`s.iktrnch.dev` is Illia's public script catalogue. It helps visitors discover a script, understand its purpose and risk, inspect its documentation or source, and copy an appropriate command for running it.

## Positioning

The catalogue publishes scripts as transparent static artifacts: every command is paired with generated metadata and a direct link to the exact source being executed.

## Operating Context

Visitors browse or search the catalogue, compare platform and risk metadata, review the raw source, then copy a command into their own terminal. Remote scripts execute code in the visitor's environment and should be reviewed before use.

## Capabilities and Constraints

- Script metadata is generated statically from Python module docstrings and shell comment headers.
- Python scripts are run from their public URL with `uv run`.
- Shell scripts use a shell-appropriate download-and-execute command.
- Raw scripts are available directly at `/<relative-path>` with no per-script documentation route.
- The site is fully prerendered for Cloudflare Pages, with no runtime Workers, APIs, or server-side fetching.
- Catalogue entries must come from the generated script registry rather than hardcoded page data.

## Brand Commitments

The site belongs to the same identity as `iktrnch.dev`: personal, technically exact, restrained, and transparent about what its code does.

## Evidence on Hand

- The generated typed registry is available at `src/lib/generated/scripts.ts`.
- Script metadata, usage examples, documentation, and public URLs are generated from repository sources.
- No testimonials, adoption claims, or usage metrics are available and none should be fabricated.

## Product Principles

- Make the exact code and its implications inspectable before execution.
- Turn discovery into a copy-ready command without hiding language-specific behavior.
- Keep metadata predictable so scripts remain easy to scan and compare.
- Prefer static, durable output over runtime infrastructure.

## Accessibility & Inclusion

All catalogue tasks must be keyboard operable, provide non-disruptive status feedback, preserve clear focus indicators, and remain usable on compact screens and with reduced motion enabled.
