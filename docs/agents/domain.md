# Domain docs

How skills use this repo's domain docs. The repo has one context: `GLOSSARY.md` and `docs/adr/` at the root.

## Before exploring

Read `GLOSSARY.md`, and the ADRs in `docs/adr/` that touch the area you're about to work in.

## Speak the glossary

When your output names a domain concept (an issue title, a refactor proposal, a hypothesis, a test name), use the glossary's term for it. Each entry's _Avoid_ line lists the synonyms it replaces: a square, not a swatch; a choice, not a commit.

A concept the glossary lacks is a signal. Either you're inventing language the project doesn't use, so reach for an existing term, or there's a real gap, so note it for `/domain-modeling`.

## Flag ADR conflicts

When your output contradicts an ADR, say so and why it's worth reopening:

> _Contradicts ADR-0004 (the link is the only stored colour), but worth reopening because…_
