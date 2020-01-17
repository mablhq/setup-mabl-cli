![mabl logo](https://avatars3.githubusercontent.com/u/25963599?s=100&v=4)

# BETA setup-mabl-cli

Github action to configure the
[the `mabl-cli` command-line client](https://help.mabl.com/docs/mabl-cli). It
installs the cli and configures it with an API key, if one is provided. Note
that API keys should be stored as secrets.

This action requires a version of node be installed as part of your workflow.
The [mabl-cli](https://www.npmjs.com/package/@mablhq/mabl-cli) will be installed into that node runtime.  
See below for an example of how to install node.

Note that this action and the mabl CLI are in BETA. Some interfaces may change
without prior notice.

## Inputs

- `version` {string} {optional} The version of the CLI to install. Defaults to
  latest if not specified.

## Environment variables

- `MABL_API_KEY` {string} {optional} If provided, this action will authenticate
  with the mabl CLI using the MABL_API_KEY.  
  The MABL_API_KEY should be stored as a repositor secret and pased as in the
  example below. Never store your MABL_API_KEY in plain test in your action.

## Requirements

- Requires node to be installed as a prior step. This is most easily done with
  the 'actions/setup-node@v1' command

## Example workflow:

```
on: [push]

name: mabl

jobs:
  test:
    name: mabl Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v1
        with:
          node-version: '12.x'
      - uses: mablhq/setup-mabl-cli@v0.2
        with:
          version: 0.1.2-beta
          workspace: V2pvHBJ-rprn1n3S4ELs3A-w
        env:
          MABL_API_KEY: ${{ secrets.MABL_API_KEY }}
      - name: Download screenshots for test
        run: mabl export JourneyRun ar5vXBJ-rpan1nSs445s3A-jr -f screenshots.zip
      - name: Upload screenshots
        uses: actions/upload-artifact@v1
        with:
          name: screenshots
          path: screenshots.zip
```

## License

The Dockerfile and associated scripts and documentation in this project are
released under the [MIT License](LICENSE).
