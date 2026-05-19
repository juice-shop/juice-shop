# Fork: dependency lockfiles for SCA

This fork (`yhaaus/juice-shop-app-sec-test`) **commits** npm lockfiles for reproducible dependency scanning (Plerion, Aikido, etc.). Upstream [OWASP Juice Shop](https://github.com/juice-shop/juice-shop) intentionally omits them.

## Lockfiles

| Tree | Path |
|------|------|
| Server | `package-lock.json` |
| Frontend | `frontend/package-lock.json` |

## Install

Use `npm ci` at the repo root (and `npm ci` in `frontend/` when working there only). After changing `package.json`, regenerate locks with `npm install` and commit the updated lockfiles.

## Merging upstream

When pulling from `juice-shop/juice-shop`, expect conflicts on `.npmrc`, `.gitignore`, workflows, and lockfiles. Keep this fork’s lockfile policy unless you deliberately realign with upstream.

## PR scan validation

Open a pull request against `master` to exercise automated SCA on the PR diff (Plerion, Aikido). This section exists only as a harmless trigger for that workflow smoke test.
