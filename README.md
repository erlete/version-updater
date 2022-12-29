# Version Updater Action

If you can relate with the following steps, then this action is for you:

1. Host the source code of your code in GitHub
2. Update your code up to a stable version
3. Release a new tag for the source code
4. Realize that the version of the metadata file does not match the tag
5. Update the version of the metadata file
6. Create another tag for the source code
7. Hope that you never forget to do this again
8. **_Forget to do this once again_**

The Version Updater Action is designed to solve this problem.

Once a release is published, the action will update the version of a metadata file to match the version of the tag. This way, you can be sure that **the version of the metadata file is always the same as the version of the tag**.

**But... does it work with any metadata file format?** Yes! It has been programmed with that purpose in mind. The action can be configured to update any metadata file, not only `package.json` files. Check out the list of [supported metadata files](#supported-metadata-files) for more information.

## Important notes

- This action requires the repository to be checked out before being executed. This can be done by using the [Actions Checkout](https://github.com/actions/checkout) action. This is intended to be fixed in the future.

- The action can only be executed over `release` events of type `published`. This is due to the fact that the action needs to know the version of the tag to update the metadata file to.

- The action is designed to be able to process version formats matching the `vX.Y.Z` format. If the version of the tag does not match this format, the action will most probably fail. Feel free to open an issue if you need support for other version formats.

## Inputs

| Input | Description | Required | Default value |
| --- | --- | --- | --- |
| `target-file` | The path to the metadata file to update | Yes | - |
| `commit-title` | The title of the commit to create | No | `"Update version to {version}"` |
| `commit-description` | The description of the commit to create | No | `"The version of the package was updated to {version} based on the release triggered by @{author} in the {branch} branch."` |
| `git-name` | The name of the user to use when committing the changes | No | `"GitHub Actions"` |
| `git-email` | The email of the user to use when committing the changes | No | `"github-actions[bot]@users.noreply.github.com"` |

### Commit title and description

The commit title and description can be customized using the `commit-title` and `commit-description` inputs. These inputs support the following placeholders:

| Placeholder | Description |
| ----------- | ----------- |
| `{author}` | Name of the user who triggered the release |
| `{branch}` | Name of the branch where the release was triggered |
| `{version}` | Tag of the release |
| `{release_title}` | Title of the release |
| `{release_description}` | Description of the release |

_The curly braces (`{}`) are required to use the placeholders. If an unlisted placeholder is used, the raw placeholder will be used instead._

## Outputs

This action does not have any outputs, except for a smile in your face when it works.

## Example usage

### Minimal implementation

**Example 1 (standard):**

```yml
uses: erlete/version-updater@v2.0
with:
  target-file: "package.json"
```

**Example 2 (customized):**

```yml
uses: erlete/version-updater@v2.0
with:
  target-file: "package.json"
  commit-title: "Bump version"
  commit-description: "The version of the package was updated to {version}."
  git-name: "John Doe"
  git-email: "johndoe@domain.com"
```

### Complete implementation

```yml
name: Update package version

on:
  release:
    types:
      - published

jobs:
  update-version:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - uses: erlete/version-updater@v2.0
        with:
          target-file: "package.json"
```

## Supported metadata files

Even though any file format can _hypothetically_ be supported, the action only supports the following metadata files (yet):

- `package.json` (and `package-lock.json`)
- `pyproject.toml`

_New metadata file formats can be added in the future. Feel free to open an issue if you need support for a specific format._
