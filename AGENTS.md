# Agent Instructions

## Repository

- This is a TypeScript Pi extension package using Bun.
- Extensions live in `extensions/`; the `pi-session-query` skill lives in `skills/`.
- Keep handoff and session-query output focused on durable context rather than duplicating transcripts.

## Validation

- Run `bun test tests/` after installing dependencies.
- Use `bun test --watch tests/` only for interactive local development.

## Version control

- Use normal Git workflows. Inspect `git status` and the diff before committing or pushing.
