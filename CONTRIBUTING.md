# Contribution Guidelines

If you would like to contribute, please submit a PR. Before requesting a
review on a pull request, make sure that the GitHub action completes
successfully.

If you encounter a problem, please file an Issue in this repo.

## Development Process

### Development Stage

1. Create a feature branch off of the main branch
2. Make sure to update the version in the `package.json` file. We do not typically use the micro version in the JSON package
definition, only the major and minor version.
3. Once the development is done, create pull request
4. Merge the changes to the main branch
5. Merge the changes to the release branch (see next section). Note that master branch should not have `lib`, `node_modules` directories, but the release branch will and this is normal.

### Building The Release

Releases are built on release branches. Each major release version should get
its own branch, e.g. release_v1.  
Releases can then be built from that branch by running

```bash
# Checkout the release branch and merge
git checkout main
git pull
git checkout release_v1
git pull
git merge main

# Compile release
npm run release

# Commit the built release files
git commit -m "<version, e.g. v1.4> release"

# Tag the release
git tag <version, e.g. v1.4>
git push origin <version, e.g. v1.4>
git push origin release_v1
```

### Releasing

Once the tag exists, you can make a new release from it in the GitHub UI.
Note that you do not have add any additional files. GitHub will
automatically attach the necessary files.

### Tagging

If you are releasing a new minor version, make sure that the major version
is retagged. This way users of the action will pick up the new minor
version automatically assuming that only the major version is specified.

In short, the major version tag should be
* deleted (e.g. `git tag -d v1`)
* pushed (e.g. `git push --delete origin v1`)
* tagged again (e.g. `git tag v1 1d4a228`)
* pushed (e.g. `git push origin v1`)

```bash
git tag -d v1
git push --delete origin v1
git tag v1 1d4a228
git push origin v1
```



