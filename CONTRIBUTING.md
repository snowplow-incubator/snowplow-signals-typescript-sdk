# Contributing (WIP)

The repository uses [changesets](https://github.com/changesets/changesets) to manage releases, changelog generation and versioning.

Every pull request that adds client functionality should have the appropriate changeset generated. To add your changeset just run `npm run changeset` and you will be prompted with inputs you need to fill.

Every feature/fix etc. will be targeting `main` as the merge target. As soon as the pull request is merged to main, changesets will open up a version pull request that includes all changes and the appropriate version bump.
