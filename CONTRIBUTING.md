# Contributing [![HuBoard](http://img.shields.io/badge/Hu-Board-blue.svg)](https://huboard.com/bkimminich/juice-shop)

[![Build Status](https://travis-ci.org/bkimminich/juice-shop.svg?branch=master)](https://travis-ci.org/bkimminich/juice-shop) [![Build status](https://ci.appveyor.com/api/projects/status/903c6mnns4t7p6fa/branch/master?svg=true)](https://ci.appveyor.com/project/bkimminich/juice-shop/branch/master) [![Test Coverage](https://codeclimate.com/github/bkimminich/juice-shop/badges/coverage.svg)](https://codeclimate.com/github/bkimminich/juice-shop) [![Code Climate](https://codeclimate.com/github/bkimminich/juice-shop/badges/gpa.svg)](https://codeclimate.com/github/bkimminich/juice-shop) [![Sauce Test Status](https://saucelabs.com/buildstatus/juice-shop)](https://saucelabs.com/u/juice-shop)

Found a bug? Crashed the app? Broken challenge? Found a vulnerability that is not on the Score Board?

Feel free to [create an issue](https://github.com/bkimminich/juice-shop/issues) or [post your ideas in the chat](https://gitter.im/bkimminich/juice-shop)! Pull requests are also highly welcome - please follow the guidelines below to make sure your PR can be merged and doesn't break anything.

[![Dependency Status](https://gemnasium.com/bkimminich/juice-shop.svg)](https://gemnasium.com/bkimminich/juice-shop)
[![Dependency Status](https://www.versioneye.com/user/projects/544a2e5ac310f92c920000ec/badge.svg?style=flat)](https://www.versioneye.com/user/projects/544a2e5ac310f92c920000ec)
[![Dependency Status](https://david-dm.org/bkimminich/juice-shop.svg)](https://david-dm.org/bkimminich/juice-shop)
[![devDependency Status](https://david-dm.org/bkimminich/juice-shop/dev-status.svg)](https://david-dm.org/bkimminich/juice-shop#info=devDependencies)
[![NSP Status](https://nodesecurity.io/orgs/juice-shop/projects/0b5e6cab-3a21-45a1-85d0-fa076226ef48/badge)](https://nodesecurity.io/orgs/juice-shop/projects/0b5e6cab-3a21-45a1-85d0-fa076226ef48)

## Git-Flow

This repository is maintained in a simplified [Git-Flow](http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/) fashion: All active development happens on the ```develop``` branch while ```master``` is used to deploy stable versions to the [Heroku demo instance](https://juice-shop.herokuapp.com) and later create tagged releases from. 

### Pull Requests

Using Git-Flow means that PRs have the highest chance of getting accepted and merged when you open them on the ```develop``` branch of your fork. That allows for some post-merge changes by the team without directly compromising the ```master``` branch, which is supposed to hold always be in a release-ready state. 

## Unit Tests

There is a full suite containing independent unit tests for the client- and server-side code. These tests verify if the normal use cases of the application work. All server-side vulnerabilities are also tested.

```
npm test
```

## End-to-end Tests

The e2e test suite verifies if all client- and server-side vulnerabilities are exploitable. It passes only when all challenges are solvable on the score board.

```
npm run protractor
```

> The e2e tests require a working internet connection in order to verify the redirect challenges!

## Mutation Tests

The [mutation tests](https://en.wikipedia.org/wiki/Mutation_testing) ensure the quality of the unit test suite by making small changes to the code that should cause one or more tests to fail. If none does this "mutated line" is not properly covered by meaningful assertions.

```
npm run stryker
```

> Currently only the client-side unit tests are covered by mutation tests. The server-side and end-to-end tests are not suitable for mutation testing because they run against a real server instance with dependencies to the database and an internet connection.

## Test Packaged Distrubution

During releases the application will be packaged into ```.zip```/```.tgz``` archives for another easy setup method. When you contribute a change that impacts what the application needs to include, make sure you test this manually on your system.
  
```
grunt package
```

Then take the created archive from ```/dist``` and follow the steps described above in [Packaged Distributions](https://github.com/bkimminich/juice-shop#packaged-distributions--) to make sure nothing is broken or missing.

## Bountysource [![Bountysource](https://www.bountysource.com/badge/tracker?tracker_id=6283055)](https://www.bountysource.com/trackers/6283055-juice-shop?utm_source=6283055&utm_medium=shield&utm_campaign=TRACKER_BADGE)

From time to time issues might get a bounty assigned which is paid out to the implementor via the Bountysource platform.

> How Bounties work:
>
> 1.   Users fund bounties on open issues or feature requests they want to see addressed.
> 2.   Developers create solutions which closes the issue and claim the bounty on Bountysource.
> 3.   Backers can accept or reject the claim.
> 4.   If accepted, Bountysource pays the bounty to the developer.
