# Contributing [![GitHub contributors](https://img.shields.io/github/contributors/bkimminich/juice-shop.svg)](https://github.com/bkimminich/juice-shop/graphs/contributors) [![HuBoard](http://img.shields.io/badge/Hu-Board-blue.svg)](https://huboard.com/bkimminich/juice-shop) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

[![Build Status](https://travis-ci.org/bkimminich/juice-shop.svg?branch=master)](https://travis-ci.org/bkimminich/juice-shop)
[![Build status](https://ci.appveyor.com/api/projects/status/903c6mnns4t7p6fa/branch/master?svg=true)](https://ci.appveyor.com/project/bkimminich/juice-shop/branch/master)
[![Test Coverage](https://codeclimate.com/github/bkimminich/juice-shop/badges/coverage.svg)](https://codeclimate.com/github/bkimminich/juice-shop)
[![Code Climate](https://codeclimate.com/github/bkimminich/juice-shop/badges/gpa.svg)](https://codeclimate.com/github/bkimminich/juice-shop)
[![bitHound Overall Score](https://www.bithound.io/github/bkimminich/juice-shop/badges/score.svg)](https://www.bithound.io/github/bkimminich/juice-shop)

Found a bug? Crashed the app? Broken challenge? Found a vulnerability
that is not on the Score Board?

Feel free to
[create an issue](https://github.com/bkimminich/juice-shop/issues) or
[post your ideas in the chat](https://gitter.im/bkimminich/juice-shop)!
Pull requests are also highly welcome - please follow the guidelines
below to make sure your PR can be merged and doesn't break anything.

## Code & Dependency Analysis Results

| Provider      |                                                                                                                                                                                        Status                                                                                                                                                                                        |
|:--------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| Gemnasium     |                                                                                                                                 [![Dependency Status](https://gemnasium.com/bkimminich/juice-shop.svg)](https://gemnasium.com/bkimminich/juice-shop)                                                                                                                                 |
| David-DM      |                                                       [![Dependency Status](https://david-dm.org/bkimminich/juice-shop.svg)](https://david-dm.org/bkimminich/juice-shop) [![devDependency Status](https://david-dm.org/bkimminich/juice-shop/dev-status.svg)](https://david-dm.org/bkimminich/juice-shop#info=devDependencies)                                                       |
| BitHound      | [![bitHound Dependencies](https://www.bithound.io/github/bkimminich/juice-shop/badges/dependencies.svg)](https://www.bithound.io/github/bkimminich/juice-shop/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/bkimminich/juice-shop/badges/devDependencies.svg)](https://www.bithound.io/github/bkimminich/juice-shop/master/dependencies/npm) |
| Node Security |                                                                                         [![NSP Status](https://nodesecurity.io/orgs/juice-shop/projects/0b5e6cab-3a21-45a1-85d0-fa076226ef48/badge)](https://nodesecurity.io/orgs/juice-shop/projects/0b5e6cab-3a21-45a1-85d0-fa076226ef48)                                                                                          |

## Git-Flow

This repository is maintained in a simplified
[Git-Flow](http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/)
fashion: All active development happens on the ```develop``` branch
while ```master``` is used to deploy stable versions to the
[Heroku demo instance](https://juice-shop.herokuapp.com) and later
create tagged releases from.

### Pull Requests

Using Git-Flow means that PRs have the highest chance of getting
accepted and merged when you open them on the ```develop``` branch of
your fork. That allows for some post-merge changes by the team without
directly compromising the ```master``` branch, which is supposed to hold
always be in a release-ready state.

## Unit & Integration Tests

There is a full suite containing

* independent unit tests for the client-side code
* integration tests for the server-side API

These tests verify if the normal use cases of the application work. All
server-side vulnerabilities are also tested.

```
npm test
```

### JavaScript Standard Style Guide

Since v2.7.0 the `npm test` script verifies code complicance with the
`standard` style before running the tests. If PRs deviate from this
coding style, they will now immediately fail their build and will not be
merged until compliant.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

> In case your PR is failing from style guide issues try running
> `standard --fix` over your code - this will fix all syntax or code
> style issues automatically without breaking your code. You might need
> to `npm i -g standard` first.

## End-to-end Tests

The e2e test suite verifies if all client- and server-side
vulnerabilities are exploitable. It passes only when all challenges are
solvable on the score board.

```
npm run protractor
```

> The e2e tests require a working internet connection in order to verify
> the redirect challenges!

## Mutation Tests

The [mutation tests](https://en.wikipedia.org/wiki/Mutation_testing)
ensure the quality of the unit test suite by making small changes to the
code that should cause one or more tests to fail. If none does this
"mutated line" is not properly covered by meaningful assertions.

```
npm run stryker
```

> Currently only the client-side unit tests are covered by mutation
> tests. The server-side and end-to-end tests are not suitable for
> mutation testing because they run against a real server instance with
> dependencies to the database and an internet connection.

## Test Packaged Distrubution

During releases the application will be packaged into
```.zip```/```.tgz``` archives for another easy setup method. When you
contribute a change that impacts what the application needs to include,
make sure you test this manually on your system.

```
grunt package
```

Then take the created archive from ```/dist``` and follow the steps
described above in
[Packaged Distributions](https://github.com/bkimminich/juice-shop#packaged-distributions--)
to make sure nothing is broken or missing.

## Bountysource [![Bountysource](https://www.bountysource.com/badge/tracker?tracker_id=6283055)](https://www.bountysource.com/trackers/6283055-juice-shop?utm_source=6283055&utm_medium=shield&utm_campaign=TRACKER_BADGE)

From time to time issues might get a bounty assigned which is paid out
to the implementor via the Bountysource platform.

> How Bounties work:
>
> 1. Users fund bounties on open issues or feature requests they want to
>    see addressed.
> 2. Developers create solutions which closes the issue and claim the
>    bounty on Bountysource.
> 3. Backers can accept or reject the claim.
> 4. If accepted, Bountysource pays the bounty to the developer.

## Localization [![Crowdin](https://d322cqt584bo4o.cloudfront.net/owasp-juice-shop/localized.svg)](https://crowdin.com/project/owasp-juice-shop)

OWASP Juice Shop uses
[Crowdin](https://crowdin.com/project/owasp-juice-shop/) as a
translation platform, which is basically offering a simple
translator/proofreader workflow very user friendly especially for
non-developers.


> Hidden beneath, Crowdin will use the dedicated `l10n_develop` Git
> branch to synchronize translations into the `app/i18n/??.json`
> language files where `??` is a language code (e.g. `en` or `de`).

If you would like to participate in the translation process, visit
https://crowdin.com/project/owasp-juice-shop/invite. If you miss a
language, please
[contact us](https://crowdin.com/mail/compose/bkimminich) and we will
add it right away!

> Right now only the UI texts are translated. Everything that comes
> directly from the server side (i.e. the database) is English only.

