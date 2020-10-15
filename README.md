![mabl logo](https://avatars3.githubusercontent.com/u/25963599?s=100&v=4)

# setup-mabl-cli

Github action to configure the
[the `mabl-cli` command-line client](https://help.mabl.com/docs/mabl-cli). It
installs the cli and configures it with an API key, if one is provided. Note
that API keys should be stored as secrets.

This action requires a version of Node.js be installed as part of your workflow.
The [mabl-cli](https://www.npmjs.com/package/@mablhq/mabl-cli) will be installed into that Node.js runtime.  
See below for an example of how to install Node.js.

Note that the mabl CLI is in BETA. Some interfaces may change
without prior notice.

## Inputs

- `version` {string} {optional} The version of the CLI to install. Defaults to
  the latest version if not specified.
- `workspace_id` {string} {optional} A workspace id to configure.  If provided, all future calls to the cli will use this workspace by default.

## Environment variables

- `MABL_API_KEY` {string} {optional} If provided, this action will authenticate
  with the mabl CLI using the `MABL_API_KEY`.  This is required if you also pass in a `workspace_id`.
  
  The `MABL_API_KEY` should be stored as a repository secret and passed as in the
  example below. Never store your MABL_API_KEY in plain test in your action.

## Requirements

- Requires Node.js to be installed as a prior step. This is most easily done with
  the `actions/setup-node@v1` action.

## Example workflow:

```
on: [push]

name: mabl

jobs:
  test:
    name: Mabl Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v1
        with:
          node-version: '12.x'

      - uses: mablhq/setup-mabl-cli@v0.4
        with:
          version: 0.6.94-beta
          workspace_id: V2pvHBJ-rprn1n3S4ELs3A-w
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

## Contributing

See [here](CONTRIBUTING.md) for details on contributing to this action.

## License

The Dockerfile and associated scripts and documentation in this project are
released under the [MIT License](LICENSE).
