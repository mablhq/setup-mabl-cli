![mabl logo](https://avatars3.githubusercontent.com/u/25963599?s=100&v=4)

# setup-mabl-cli

GitHub action to configure the
[`mabl-cli` command-line client](https://help.mabl.com/docs/mabl-cli). It
installs and configures the CLI with a mabl API key, if one is provided. Note
that API keys should be stored as [GitHub secrets](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-an-organization).

This action requires Node.js 12+ be installed as part of your workflow.
The [mabl-cli](https://www.npmjs.com/package/@mablhq/mabl-cli) will be installed into that Node.js runtime.  
See below for an example of how to install Node.js.

## Inputs

- `version` {string} {optional} The version of the CLI to install. Defaults to
  the latest version if not specified.
- `workspace-id` {string} {optional} A workspace id to configure.  If provided, all future calls to the CLI will use this workspace by default.

## Environment variables

- `MABL_API_KEY` {string} {optional} If provided, this action will authenticate
  with the mabl CLI using the `MABL_API_KEY`.  This is required if you also pass in a `workspace-id`.
  
  The `MABL_API_KEY` should be stored as a [GitHub secret](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-an-organization) and passed as in the
  example below. **Never** store your `MABL_API_KEY` as plain text in your workflow YAML.

## Requirements

- Requires Node.js 12+ be installed as a prior step. This is most easily done with
  the `actions/setup-node@v2` action.

## Examples

### Basic Example

This workflow shows how to use the mabl CLI in your workflow to export screenshots and upload them to a location.

```
on: [push]

name: mabl

jobs:
  test:
    name: Mabl Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v2
        with:
          node-version: '16.x'

      - uses: mablhq/setup-mabl-cli@v1
        with:
          workspace-id: V2pvHBJ-rprn1n3S4ELs3A-w
        env:
          MABL_API_KEY: ${{ secrets.MABL_API_KEY }}

      - name: Download screenshots for test
        run: mabl test-runs export ar5vXBJ-rpan1nSs445s3A-jr -f screenshots.zip

      - name: Upload screenshots
        uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: screenshots.zip
```

### Running Tests on Multiple Operating Systems in Parallel

This workflow demonstrates how to use the matrix strategy to kick off headless test runs in parallel on Ubuntu Linux, macOS, and Windows.

```
on: [push]

name: mabl

jobs:
  test:
    name: Mabl Test
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ ubuntu-latest, macos-latest, windows-latest ]
    steps:
      - uses: actions/setup-node@v2
        with:
          node-version: '16.x'

      - uses: mablhq/setup-mabl-cli@v1
        with:
          workspace: 8OfudHtGzLyWLU1-LBjZtQ-w
        env:
          MABL_API_KEY: ${{ secrets.MABL_API_KEY }}
      
      - name: Run tests
        run: mabl tests run --id P9BXWTEbMLeAdAPRT35jWA-j --headless --environment-id Jw7oBZlxKXVGxK3_eWxcWQ-e
```

You can also see how this GitHub action is tested on multiple operating
systems in parallel in the [workflow file](https://github.com/mablhq/setup-mabl-cli/blob/master/.github/workflows/push-workflow.yaml) in this repo.

## Contributing

See [here](CONTRIBUTING.md) for details on contributing to this action.

## License

The Dockerfile and associated scripts and documentation in this project are
released under the [MIT License](LICENSE).
