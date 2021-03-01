# Contribution Guidelines

If you would like to contribute, please submit a PR. Before requesting a
review on a pull request, make sure that the GitHub action completes
successfully.

If you encounter a problem, please file an Issue in this repo.

## Releasing

Releases are built on release branches. Each major release version should get
its own branch, e.g. release_v1.  
Releases can then be built from that branch by running

```bash
# Compile release
npm run release

# Commit the built release files
git commit -m "<version, e.g. v1.4> release"

# Tag the release
git tag <version, e.g. v1.4>
git push origin <version, e.g. v1.4>
```

Once the tag exists, you make a new release from it in the github UI.

## Versioning

We do not typically use the micro version in the JSON package
definition, only the major and minor version.
