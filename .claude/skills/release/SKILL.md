---
name: release
description: Release a new version of @rafu1987/razorbox to npm and GitHub. Use when the user says "release", "release new version", "release new", "publish a new version", "cut a release", "/release", or names a bump such as "release patch", "release minor" or "release 0.8.0".
---

# Release razorbox

Releases are published by GitHub Actions (`.github/workflows/release.yml`) when a
`v*` tag is pushed. This skill prepares and pushes that tag, then watches the
workflow until the package is live. Run every step yourself; the user's request
to release is the go-ahead for the push. Stop and ask only where this file says so.

## 1. Preconditions

Run these and stop with a clear message if one fails:

```bash
git rev-parse --abbrev-ref HEAD   # must be main
git status --porcelain            # must be empty
git fetch origin --tags
git status -sb | head -1          # must not be "behind"
gh auth status                    # gh must be logged in
```

Then list what will be released:

```bash
last=$(git describe --tags --abbrev=0 --match 'v*')
git log "$last"..HEAD --format='%h %s'
git log origin/main..HEAD --format='%h %s' --name-only   # commits not pushed yet
```

- If there are no commits since `$last`, stop: there is nothing to release.
- **Unpushed demo changes:** if any not-yet-pushed commit touches `demo.html`,
  `demo/` or `vite.demo.config.js`, ask the user before continuing. Releasing
  pushes `main`, which deploys the demo to GitHub Pages, and demo changes are
  only pushed after the user has reviewed them.

## 2. Pick the version

Current version: `node -p "require('./package.json').version"`. Map the request
to an `npm version` argument; npm computes the new version itself:

| User says | `<bump>` | Example from 0.7.0-alpha.7 |
| --------- | -------- | -------------------------- |
| "release", "release new", "new version" (no bump named) | `prerelease --preid alpha` | 0.7.0-alpha.8 |
| "release patch" / "minor" / "major" | `patch` / `minor` / `major` | 0.7.0 / 0.7.0 / 1.0.0 |
| an explicit version, e.g. "release 0.8.0" | `0.8.0` | 0.8.0 |

Ask for confirmation before a **minor or major** bump and before the first
**stable (non-prerelease)** version, naming the exact version it will produce.
For a stable release, also mention that `PRERELEASES_AS_LATEST` in
`.github/workflows/release.yml` can be set to `false` once 1.0 is out, so future
prereleases go to their channel tag instead of `latest`.

## 3. Check and tag

```bash
yarn release:check
npm version <bump> -m "Release v%s"
```

If your session's instructions ask for a commit attribution trailer, add it as a
second `-m` argument. Read the new version afterwards with
`node -p "require('./package.json').version"` and use it as `<new-version>` below.

- `yarn release:check` runs lint, unit, package, browser, accessibility and
  package-export checks. If it fails, stop and report; do not release.
- `npm version` runs the `version` script: it writes the CHANGELOG.md section
  from the commit subjects (`scripts/changelog.mjs`), rebuilds `dist/`, and
  creates the `Release vX.Y.Z` commit and the `vX.Y.Z` tag.
- Show the user the new CHANGELOG.md section (`git show HEAD -- CHANGELOG.md`).

## 4. Push

Push the branch and the tag **separately**; pushing both at once has failed to
trigger the release workflow before.

```bash
git push origin main
git push origin v<new-version>
```

## 5. Watch the release

```bash
sleep 15
run=$(gh run list --workflow release.yml --branch v<new-version> --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$run" --exit-status --interval 20
```

Use a long Bash timeout (the workflow runs CI first, about 3 to 5 minutes), or
run the watch in the background and wait for it to finish.

If no run appears within a minute, check `gh run list --limit 5`. If the tag
exists on GitHub but no Release run started, delete and re-push only the tag:
`git push origin :refs/tags/v<new-version> && git push origin v<new-version>`
(safe only while nothing has been published for that version).

## 6. Verify

```bash
npm view @rafu1987/razorbox dist-tags --prefer-online   # may take 1-2 minutes to show the new version
gh release view v<new-version> --json name,isPrerelease,url
```

Report to the user: the version, the npm dist-tag it is on, the GitHub release
URL, and the changelog section.

## If something fails

- Read the failure first: `gh run view <run> --log-failed`. Do not guess.
- **CI failed:** fix the cause in a new commit on `main`. Nothing was published,
  so move the tag to the fixed commit (`git tag -d`, delete the remote tag,
  re-tag `v<new-version>` on the fix, push the tag). The `package.json` version
  is unchanged, so the workflow's version check still passes.
- **Publish failed with 404 / permission denied:** npm trusted publishing does
  not accept the workflow. Ask the user to run `npm trust list @rafu1987/razorbox`
  and check that it lists repository `rafu1987/razorbox`, file `release.yml`
  and permission `publish`. After it is fixed, re-run only the failed job:
  `gh run rerun <run> --failed`.
- **Never** delete or move a tag after its version was published to npm, and
  never re-publish a version. Release a new version instead.
- Changing npm dist-tags (`npm dist-tag ...`) needs the user's npm login with
  2FA; give them the exact command instead of running it.
