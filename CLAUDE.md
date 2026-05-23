# Snowplow Signals TypeScript SDK — Agent Entry Point

This is the TypeScript SDK for Snowplow Signals — a client library for reading attributes and interventions from the Signals API. Distributed as a multi-package npm workspace with separate browser/Node entry points.

## Components at a glance

| Path | Purpose |
|---|---|
| `packages/signals-core/` | Platform-agnostic core (types, common client logic) |
| `packages/signals-node/` | Node-specific entry point |
| `integration-tests/` | End-to-end tests against a live Signals API |

## Build system — npm workspaces

```bash
# Setup
npm install

# Lint + type-check (each package's `lint` runs `tsc`)
npm run lint --workspaces --if-present

# Tests (each package uses Jest)
npm test                            # all workspaces
npm run test --workspace @snowplow/signals-core   # just one

# Build
npm run build                       # builds all workspaces

# Releases — managed by changesets
npm run changeset                   # add a changeset for your change
```

Releases use [changesets](https://github.com/changesets/changesets). Any PR that changes published behaviour should include a changeset (`npm run changeset` and follow the prompts).

## What Claude must never do

1. **Never modify existing test assertions** — assertions express human-defined correctness; only the developer changes them.
2. **Never change the public API shape of either package** implicitly — exported types and function signatures are contracts with SDK users.
3. **Never edit generated OpenAPI model files by hand** — see `CONTRIBUTING.md` for the regeneration command.
4. **Never commit secrets** — no API keys, tokens, or credentials in any file.
5. **Never keep unused or dead code** unless explicitly instructed.

## Implementing tickets

When you're triggered by the `implement` label on a GitHub issue (or asked to implement an issue / Jira ticket locally), the issue body is the spec — read it carefully before anything else.

Then:

1. Read this file. If the change touches only one workspace package, work inside that package — its `package.json` scripts and tests are the canonical surface.
2. Implement the change as described in the issue body. Don't deviate from its file-level intent. If you find an error in it, note the deviation in the PR description.
3. Keep changes minimal and focused. Don't refactor unrelated code.
4. Add or modify tests for every new feature or bug fix.
5. If the change is user-facing for either published package, run `npm run changeset` to add a release note.
6. If you discover a real architectural blocker the spec didn't anticipate, stop and post a comment on the issue. Don't guess.

Before opening the PR:

- `npm run lint --workspaces --if-present` — type-checks (each package's `lint` script runs `tsc`)
- `npm test` — Jest tests pass across all workspaces
- Changeset added if the change is user-facing

PR shape:

- **Branch**: descriptive name with the Jira key, e.g. `feat/aisp-1234-add-foo` or `fix/aisp-1234-edge-case`.
- **Commits**: include the Jira key, e.g. `[AISP-1234] Add foo`.
- **PR title**: same `[AISP-XXX] Description` prefix. If a GitHub issue number is provided, append `(closes #NNN)`.
- **PR body**: Summary, `Closes #NNN`, Changes, Testing, Changeset (link or note saying none needed).

See `CONTRIBUTING.md` for the broader workflow.
