# Version Updater Action

This is a really simple action that allows the user to update the version of a `package.json` file automatically so that it matches the version of the current tag.

This is specially useful when dealing with constant deployment of packages, since every developer knows the terrible sensation of publishing a GitHub Release and remembering that the version of the package is not the same as the tag.

The action simply updates the version of the `package.json` file to match the version of the tag and then commits the changes to the repository using a github configuration provided by the user or defaulting to the GitHub Action profile (see [Inputs](#inputs) for more information).

## Important notes

- This action requires the repository to be checked out before being executed. This can be done by using the [Actions Checkout](https://github.com/actions/checkout) action.

- Furthermore, this action relies on the [`github.ref`](https://github.com/actions/checkout) payload variable to get the version of the tag. If the action is not performed over a release publish event, the value of the `github.ref` variable will not have the correct format. Make sure to only execute the action on release publish events (see [Example usage](#example-usage) for more information).

- The action is designed to be able to process version formats matching the `vX.Y.Z` format. If the version of the tag does not match this format, the action will most probably fail.

## Inputs

| Input | Description | Required | Default |
| --- | --- | --- | --- |
| `git-email` | The email of the author of the commit. | No | `"action@github.com"` |
| `git-name` | The name of the author of the commit. | No | `"GitHub Action"` |
| `target-version` | The version to update the `package.json` file to. | Yes | |
| `target-file` | The path to the `package.json` file. | Yes | |
| `target-branch` | The branch to commit the changes to. | Yes | |

## Outputs

This action does not have any outputs.

## Example usage

Extracted snippet from a workflow file:

```yaml
uses: actions/version-updater-action@v1
with:
  git-email: "youremail@domain.com"
  git-name: "Your Name"
  target-version: ${{github.ref}}
  target-file: "package.json"
  target-branch: "main"
```

Complete workflow file:

```yaml
name: Update version

on:
  release:
    types: [published]

jobs:

  update-version:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - uses: actions/version-updater-action@v1
        with:
          git-email: "youremail@domain.com"
          git-name: "Your Name"
          target-version: ${{github.ref}}
          target-file: "package.json"
          target-branch: "main"
```
