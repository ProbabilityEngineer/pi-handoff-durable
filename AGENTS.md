# Agent Instructions

## Repository

- This is a TypeScript Pi extension package using Bun.
- Run the test suite with `bun test tests/` after installing dependencies.
- Extensions live in `extensions/`; the `pi-session-query` skill lives in `skills/`.

## Context discipline

- Never recursively search `node_modules`, `.git`, build output, minified files, or vendored dependencies.
- Prefer targeted searches with explicit paths and exclusions.
- Use `read` with `offset`/`limit` for large files; avoid reading entire documentation files unless the task requires it.
- Keep tool output focused and stop investigating once the question is answered.

## Local VCS

- Use normal Git workflows for this repository; do not use jj/Jujutsu.
- Inspect `git status` before starting and verify branch/remote alignment before declaring work clean or pushed.
