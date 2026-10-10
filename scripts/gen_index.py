#!/usr/bin/env python3
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

Generate INDEX.md from a directory.

## Usage

uv run https://s.iktrnch.dev/script/gen_index.py ./docs
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import tempfile
from collections import Counter
from dataclasses import dataclass, replace
from pathlib import Path, PurePosixPath
from urllib.parse import quote

INDEX_TITLE = "# Documentation Index"
H1_RE = re.compile(r"^ {0,3}#(?:[ \t]+(.*?)[ \t]*|[ \t]*)$")
FENCE_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")


class UserError(Exception):
    """An expected error that should be shown without a traceback."""


@dataclass(frozen=True)
class Document:
    """A Markdown document and the information needed to render its link."""

    path: Path
    relative_path: PurePosixPath
    title: str
    display_title: str


class Terminal:
    """Small ANSI-aware stderr presenter."""

    RESET = "\033[0m"
    GREEN = "\033[32m"
    RED = "\033[31m"
    YELLOW = "\033[33m"
    CYAN = "\033[36m"
    BOLD = "\033[1m"
    DIM = "\033[2m"

    def __init__(self) -> None:
        self.colour = sys.stderr.isatty() and "NO_COLOR" not in os.environ

    def style(self, text: object, code: str) -> str:
        value = str(text)
        return f"{code}{value}{self.RESET}" if self.colour else value

    def line(self, text: str = "") -> None:
        print(text, file=sys.stderr)

    def error(self, text: str) -> None:
        self.line(self.style(f"✗ Error: {text}", self.RED))


def build_parser() -> argparse.ArgumentParser:
    """Create the command-line parser without performing filesystem work."""
    parser = argparse.ArgumentParser(
        description="Generate a human-readable INDEX.md for a documentation directory.",
        usage="%(prog)s <docs-directory> [--dry-run] [--output FILE]",
    )
    parser.add_argument(
        "docs_directory",
        nargs="?",
        metavar="<docs-directory>",
        help="documentation directory to scan",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="print generated Markdown to stdout without writing a file",
    )
    parser.add_argument(
        "--output",
        metavar="FILE",
        help="output file (default: <docs-directory>/INDEX.md)",
    )
    return parser


def filename_title(path: Path) -> str:
    """Turn a Markdown filename into a readable fallback title."""
    if path.name.casefold() == "readme.md":
        return "Overview"
    words = re.sub(r"[-_]+", " ", path.stem).strip()
    return " ".join(
        word if not word.islower() else word.capitalize() for word in words.split()
    )


def directory_title(name: str) -> str:
    """Turn a directory component into a readable section/context label."""
    words = re.sub(r"[-_]+", " ", name).strip()
    return " ".join(
        word if not word.islower() else word.capitalize() for word in words.split()
    )


def extract_title(path: Path) -> str:
    """Return the first H1 outside fenced code, or a filename-based title."""
    fence_character: str | None = None
    fence_length = 0

    try:
        with path.open(
            "r", encoding="utf-8-sig", errors="strict", newline=None
        ) as source:
            for raw_line in source:
                line = raw_line.rstrip("\r\n")
                fence = FENCE_RE.match(line)
                if fence:
                    marker = fence.group(1)
                    if fence_character is None:
                        fence_character = marker[0]
                        fence_length = len(marker)
                    elif marker[0] == fence_character and len(marker) >= fence_length:
                        # Closing fences may contain only whitespace after the marker.
                        if not fence.group(2).strip():
                            fence_character = None
                            fence_length = 0
                    continue
                if fence_character is not None:
                    continue

                heading = H1_RE.match(line)
                if not heading:
                    continue
                title = (heading.group(1) or "").strip()
                # CommonMark permits an optional, whitespace-separated closing run.
                title = re.sub(r"[ \t]+#+[ \t]*$", "", title).strip()
                if title:
                    return title
    except (OSError, UnicodeError) as exc:
        raise UserError(f"Could not read '{path}': {exc}") from exc

    return filename_title(path)


def _same_path(left: Path, right: Path) -> bool:
    """Compare paths robustly even when one of them does not exist yet."""
    try:
        return left.resolve(strict=False) == right.resolve(strict=False)
    except OSError:
        return os.path.abspath(left) == os.path.abspath(right)


def discover_documents(docs_directory: Path, output_path: Path) -> list[Document]:
    """Discover Markdown files without descending into directory symlinks."""
    documents: list[Document] = []

    def raise_walk_error(error: OSError) -> None:
        raise error

    try:
        for root, directory_names, file_names in os.walk(
            docs_directory, topdown=True, followlinks=False, onerror=raise_walk_error
        ):
            root_path = Path(root)
            # Pruning every directory symlink prevents loops and out-of-tree traversal.
            directory_names[:] = sorted(
                (
                    name
                    for name in directory_names
                    if not (root_path / name).is_symlink()
                ),
                key=str.casefold,
            )
            for file_name in sorted(file_names, key=str.casefold):
                path = root_path / file_name
                if path.suffix.casefold() != ".md":
                    continue
                if path.name.casefold() == "index.md" or _same_path(path, output_path):
                    continue
                relative = PurePosixPath(path.relative_to(docs_directory).as_posix())
                title = extract_title(path)
                documents.append(Document(path, relative, title, title))
    except UserError:
        raise
    except OSError as exc:
        target = exc.filename or docs_directory
        raise UserError(f"Could not scan '{target}': {exc.strerror or exc}") from exc

    return documents


def _path_sort_key(document: Document) -> tuple[int, str, str]:
    """Sort README first, then compare stable POSIX relative paths."""
    path_text = document.relative_path.as_posix()
    return (
        document.relative_path.name.casefold() != "readme.md",
        path_text.casefold(),
        path_text,
    )


def disambiguate_titles(documents: list[Document]) -> list[Document]:
    """Prefix duplicate titles with the shortest distinguishing parent context."""
    title_counts = Counter(document.title.casefold() for document in documents)
    result: list[Document] = []

    for document in documents:
        if title_counts[document.title.casefold()] == 1:
            result.append(document)
            continue

        parents = document.relative_path.parts[:-1]
        # Increase context until this label differs from every duplicate peer.
        chosen = document.title
        distinguished = False
        for depth in range(1, len(parents) + 1):
            context = " ".join(directory_title(part) for part in parents[-depth:])
            candidate = f"{context} {document.title}"
            peer_labels = []
            for peer in documents:
                if (
                    peer is document
                    or peer.title.casefold() != document.title.casefold()
                ):
                    continue
                peer_parents = peer.relative_path.parts[:-1]
                peer_context = " ".join(
                    directory_title(part) for part in peer_parents[-depth:]
                )
                peer_labels.append(f"{peer_context} {peer.title}".casefold())
            chosen = candidate
            if candidate.casefold() not in peer_labels:
                distinguished = True
                break
        if not distinguished:
            # Equal titles can also occur in the same directory (or at the root),
            # where parent context alone cannot make their labels unique.
            chosen = (
                f"{filename_title(Path(document.relative_path.name))} {document.title}"
            )
        result.append(replace(document, display_title=chosen))

    return result


def group_documents(
    documents: list[Document],
) -> tuple[list[Document], list[tuple[str, list[Document]]]]:
    """Split root documents from dynamically discovered first-level sections."""
    root_documents = sorted(
        (document for document in documents if len(document.relative_path.parts) == 1),
        key=lambda document: (
            document.relative_path.name.casefold(),
            document.relative_path.name,
        ),
    )
    section_names = sorted(
        {
            document.relative_path.parts[0]
            for document in documents
            if len(document.relative_path.parts) > 1
        },
        key=lambda name: (name.casefold(), name),
    )
    sections: list[tuple[str, list[Document]]] = []
    for section_name in section_names:
        members = [
            document
            for document in documents
            if len(document.relative_path.parts) > 1
            and document.relative_path.parts[0] == section_name
        ]
        sections.append((section_name, sorted(members, key=_path_sort_key)))
    return disambiguate_titles(root_documents), [
        (name, disambiguate_titles(members)) for name, members in sections
    ]


def escape_link_label(title: str) -> str:
    """Escape characters that can terminate or alter a Markdown link label."""
    return title.replace("\\", "\\\\").replace("[", "\\[").replace("]", "\\]")


def render_document(document: Document) -> str:
    """Render one document as a flat Markdown list item."""
    label = escape_link_label(document.display_title)
    destination = quote(document.relative_path.as_posix(), safe="/")
    return f"- [{label}]({destination})"


def generate_markdown(
    root_documents: list[Document], sections: list[tuple[str, list[Document]]]
) -> str:
    """Render the complete index with exactly one trailing LF newline."""
    blocks = [INDEX_TITLE]
    if root_documents:
        blocks.append(
            "## General\n\n" + "\n".join(map(render_document, root_documents))
        )
    for section_name, documents in sections:
        heading = directory_title(section_name)
        blocks.append(f"## {heading}\n\n" + "\n".join(map(render_document, documents)))
    return "\n\n".join(blocks) + "\n"


def write_if_changed(output_path: Path, content: str) -> str:
    """Atomically create or update the output, avoiding unchanged writes."""
    try:
        if output_path.exists():
            if not output_path.is_file():
                raise UserError(f"Output path is not a file: '{output_path}'")
            try:
                # Compare bytes so a CRLF or BOM-bearing file is normalized to
                # the required UTF-8/LF representation instead of left untouched.
                existing = output_path.read_bytes()
            except OSError as exc:
                raise UserError(
                    f"Could not read output '{output_path}': {exc}"
                ) from exc
            if existing == content.encode("utf-8"):
                return "unchanged"
            mode = output_path.stat().st_mode
            state = "updated"
        else:
            mode = 0o644
            state = "created"

        if not output_path.parent.is_dir():
            raise UserError(f"Output directory does not exist: '{output_path.parent}'")

        temporary_name: str | None = None
        try:
            descriptor, temporary_name = tempfile.mkstemp(
                prefix=f".{output_path.name}.", suffix=".tmp", dir=output_path.parent
            )
            with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as target:
                target.write(content)
                target.flush()
                os.fsync(target.fileno())
            os.chmod(temporary_name, mode)
            os.replace(temporary_name, output_path)
            temporary_name = None
        finally:
            if temporary_name is not None:
                try:
                    os.unlink(temporary_name)
                except OSError:
                    pass
        return state
    except UserError:
        raise
    except OSError as exc:
        raise UserError(f"Could not write '{output_path}': {exc}") from exc


def display_path(path: Path) -> str:
    """Prefer a concise cwd-relative path for terminal diagnostics."""
    try:
        relative = path.relative_to(Path.cwd())
        return f".{os.sep}{relative}" if relative.parts else "."
    except ValueError:
        return str(path)


def present_scan(
    terminal: Terminal,
    docs_directory: Path,
    output_path: Path,
    root_documents: list[Document],
    sections: list[tuple[str, list[Document]]],
) -> None:
    """Print a concise scan summary to stderr."""
    terminal.line(terminal.style("Documentation Index Generator", Terminal.BOLD))
    terminal.line()
    terminal.line(
        f"  Directory   {terminal.style(display_path(docs_directory), Terminal.CYAN)}"
    )
    terminal.line(
        f"  Output      {terminal.style(display_path(output_path), Terminal.CYAN)}"
    )
    terminal.line()
    terminal.line("  Scanning documentation...")
    count = len(root_documents) + sum(len(items) for _, items in sections)
    terminal.line(f"  Found {count} Markdown {'file' if count == 1 else 'files'}")
    terminal.line(
        f"  Found {len(sections)} {'section' if len(sections) == 1 else 'sections'}"
    )
    if sections or root_documents:
        terminal.line()
    for name, items in sections:
        terminal.line(f"  {directory_title(name):<20} {len(items)} documents")
    if root_documents:
        terminal.line(f"  {'Root':<20} {len(root_documents)} documents")


def run(arguments: list[str] | None = None) -> int:
    """Run the CLI and return a process exit status."""
    parser = build_parser()
    args = parser.parse_args(arguments)
    terminal = Terminal()

    if args.docs_directory is None:
        terminal.error("Documentation directory is required.")
        terminal.line()
        terminal.line(f"Usage: {parser.prog} <docs-directory>")
        terminal.line(f"Example: {parser.prog} ./docs")
        return 2

    docs_directory = Path(args.docs_directory).expanduser().absolute()
    output_path = (
        Path(args.output).expanduser().absolute()
        if args.output
        else docs_directory / "INDEX.md"
    )

    if not docs_directory.exists():
        terminal.error(
            f"Documentation directory does not exist: '{args.docs_directory}'"
        )
        return 1
    if not docs_directory.is_dir():
        terminal.error(
            f"Documentation path is not a directory: '{args.docs_directory}'"
        )
        return 1

    try:
        documents = discover_documents(docs_directory, output_path)
        root_documents, sections = group_documents(documents)
        markdown = generate_markdown(root_documents, sections)
        present_scan(terminal, docs_directory, output_path, root_documents, sections)

        if args.dry_run:
            # stdout is deliberately reserved for redirectable Markdown output.
            sys.stdout.write(markdown)
            terminal.line()
            terminal.line(
                terminal.style("✓ Dry run complete; no files written", Terminal.GREEN)
            )
            return 0

        state = write_if_changed(output_path, markdown)
        terminal.line()
        if state == "unchanged":
            terminal.line(
                terminal.style(
                    f"✓ Unchanged {display_path(output_path)}", Terminal.GREEN
                )
            )
        else:
            verb = "Created" if state == "created" else "Updated"
            terminal.line(
                terminal.style(f"✓ {verb} {display_path(output_path)}", Terminal.GREEN)
            )
        count = len(root_documents) + sum(len(items) for _, items in sections)
        terminal.line(f"  {count} documents indexed")
        terminal.line(f"  {len(sections)} sections created")
        return 0
    except UserError as exc:
        terminal.error(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(run())
