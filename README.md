This is the prebuild branch. 

The only directory used in it is prebuild/. 

Otherwise files are taken from the branch being built.

# Changes:

## 2024-11-01 btsimonh

Added the below notes.

Added macos arm64 prebuilds.



# notes from prebuild.yml:

```
# Release procedure:
# 1. On the master branch, update the changelog and stage it in git.
# 2. Run `yarn version --[major|minor|patch]`. (This tags the commit.)
# 3. Push both the commit and tags to GitHub (`git push --tags Automattic` and
#    `git push Automattic HEAD:master`, where "Automattic" is the remote name
#    for git@github.com:Automattic/node-canvas.git).
# 4. Create a draft release manually using the GitHub UI for the new tag.
# 5. Switch to the prebuilds branch.
# 6. Set the `jobs.*.strategy.matrix.node` arrays to the set of Node.js versions
#    to build for.
# 7. Set the `jobs.*.strategy.matrix.canvas_tag` arrays to the set of Canvas
#    tags to build. (Usually this is a single tag, but can be an array when a
#    new version of Node.js is released and older versions of Canvas need to be
#    built.)
# 8. Commit this file and push.
# 9. In the Actions tab, navigate to the "Make Prebuilds" workflow and click
#    "Run workflow". Select the `prebuilds` branch so that that branch's
#    prebuild.yaml file is used.
# 10.Once the builds succeed, promote the draft release to a full release and
#    run npm publish.

# Note that the files in the prebuild/ directory will be used from the commit
# that was used to trigger the prebuild workflow. They will not be from the
# commit/tag that you are building. Because of differences in the provided
# versions of git, this is achieved in a different way on Linux than on Mac and
# Win.
#
# Pay particular attention to changes to binding.gyp on master. That file is not
# used! The ones in prebuild/**/ are.

# Tip: If uploads are inexplicably failing, open the release in GitHub, click
# "edit" and delete any assets that are in purgatory (have a /!\ next to them).
```

### Prebuilding only a specific platform:

When manually running `Make Prebuilds`, you should be asked for `Target os`.

Select the single target os OR the default multiple OSes.


### prebuilding for your own repo.

If you fork, and prebuild on your own repo, you will need to create a release based on a tag.

Prebuild WILL checkout the tag you specify in the cavnas tag property for each OS, and will build THAT tag from master - not your master HEAD or another branch.

e.g.:
```
        canvas_tag: ["vdev"] # e.g. "v2.6.1"`
```        

Prebuild will upload the output to YOUR repo into the release you created.

IF you want to USE your prebuilds, you would need to change (in package.json):
```
  "repository": "git://github.com/Automattic/node-canvas.git",
```
and
```
  "version": "3.0.0-rc2",
```
in the installed branch to reflect the repo you want to pull released prebuilds from,

and for version, this MUST match your tag without 'v' prefix (e.g. a version of 'dev' needs a tag of 'vdev')










