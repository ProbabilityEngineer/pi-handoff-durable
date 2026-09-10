# Agent Instructions

## Repository

- This is Sam's fork of the TypeScript Pi extension package `@ssweens/pi-handoff`.
- Extensions live in `extensions/`; the package entry points are `extensions/handoff.ts` and `extensions/session-query.ts`.
- The `pi-session-query` skill lives in `skills/pi-session-query/`.
- Install or update the package globally from this checkout with `pi install . --approve` when needed.
- Keep handoff and session-query output focused on durable context rather than duplicating transcripts.
- Preserve Pi peer-dependency compatibility; do not vendor or replace the Pi package namespaces without an intentional compatibility change.

## Validation

- Run the repository's configured test suite after installing dependencies; do not assume Bun is available.
- Use the project's test runner in non-watch mode for validation.

## Work tracking

- `clu` is the authoritative source of project tasks and work state.
- At the start of substantial work, run `clu ready`, claim the appropriate task with `clu claim --context`, and read inherited context before editing.
- Record discovered work and useful task-specific notes in `clu`; preserve dependencies.
- Before finishing, close completed work in `clu` and leave incomplete or blocked work represented there.

## Project invariants

- Preserve existing handoff, compaction, session-switch, parent-session, and durable-persistence behavior unless the task explicitly changes it.
- Keep changes safe around asynchronous agent lifecycle events and avoid duplicate session switches.
