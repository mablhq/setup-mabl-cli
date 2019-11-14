![mabl logo](https://avatars3.githubusercontent.com/u/25963599?s=100&v=4)

# setup-mabl-cli

Github action to configure the
[the `mabl-cli` command-line client](https://help.mabl.com/docs/mabl-cli). It
installs the cli and configures it with an API key, if one is provided.  Note that API keys
should be stored as secrets.

This action requires a version of node be installed as part of your workflow.  See below for an example of how to install node.

## Inputs

- `version` {string} {optional} The version of the CLI to install. Defaults to
  latest if not specified.

## Example workflow:

```
on: [push]

name: mabl

jobs:
  test:
    name: mabl Test
    runs-on: ubuntu-latest
    steps:
      - uses: mablhq/setup-mabl-cli@v1.0
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
