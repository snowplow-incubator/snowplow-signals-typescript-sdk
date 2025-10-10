# Contributing

## **Introduction**
This document serves as a comprehensive reference for all teams contributing to Signals code base changes. Our goal is to ensure consistency, maintainability, and quality across all components and services. This guide outlines the necessary criteria and standards that must be met.

## Branching Strategy

### Main branches
main: Production ready code.

### Supporting branches
feature/<name>: For new features.
fix/<name>: For fixes to production.
chore/<name>: For updates not affecting production code.

### Rules
- Always branch off `main`.
- Keep branches short-lived and regularly rebase them onto `main` to stay up to date.

## Versioning
We follow [Semantic Versioning](https://semver.org/):
`MAJOR` version: Breaking changes
`MINOR` version: New features, backward-compatible
`PATCH` version: Bug fixes

- **Before 1.0.0:** Breaking changes may occur in minor version bumps (0.x → 0.y).
- **After 1.0.0:** Any breaking change will require incrementing the **MAJOR** version.

## Commits
- Prefix your commit with the JIRA reference, where possible
E.g. `[AISP-184] XYZ`

## PRs
- Make sure to name the PR starting with the JIRA reference:
E.g. `[AISP-184] XYZ`

## Release Process
The repository uses [changesets](https://github.com/changesets/changesets) to manage releases, changelog generation and versioning.

Every pull request that adds client functionality should have the appropriate changeset generated:

### Adding a Changeset
1. Run `npm run changeset`
2. Select the type of change (**major / minor / patch**)
3. Enter a short description — this will appear in the changelog
4. Commit the generated file under `.changeset/` to the same commit as your feature/bugfix

Every feature/fix etc. will be targeting main as the merge target. As soon as the pull request is merged to main, changesets will open up a version pull request that includes all changes and the appropriate version bump.

### Steps
1. Ensure all required PRs have been merged into `main`.
2. Wait for the **automated Version PR** from the Changesets bot
3. Review the Version PR:
   - Confirm version bump accuracy (major / minor / patch)
   - Verify changelog reflects real user-facing changes
   - Ensure no missing or duplicate entries
4. Approve and merge the Version PR into `main`
5. CI/CD will automatically publish the SDK package (npm)
6. Verify that tag and release are automatically created matching the version
7. Announce the release in `#releases` Slack channel

### Release Checklist
Before approving and merging a Version PR, ensure all items below are completed:

- [ ] All merged PRs include valid changesets
- [ ] Version PR shows the correct version bump
- [ ] Changelog is updated
- [ ] Automated tests pass
- [ ] Documentation updated for new/changed APIs
- [ ] Version PR approved by at least one AI Team member

## Updating openapi models

To pull models types from any version of the Signals API, you can use
`npx @openapitools/openapi-generator-cli generate -i {SIGNALS_API_URL}/openapi.json -g typescript -o ./openapi/snowplow_signals/openapi_types --additional-properties=modelPropertyNaming=original`

Then pull any required models and delete the generated files.
