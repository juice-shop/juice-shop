# Proving that an application is as broken as intended

Typically you want to use end-to-end (e2e) tests to prove that everything __works__ as intended in a realistic environment. In the [Juice Shop](http://bkimminich.github.io/juice-shop/) application that idea is changed to the contrary. Here the main purpose of the e2e test suite is to prove that the application is as __broken__ as intended!

## Juice Shop: Broken beyond hope - but on purpose!

_"WTF?"_ you might ask, and rightfully so. Juice Shop is a special kind of application. It is an _intentionally insecure_ Javascript web application designed to be used during security trainings, classes, workshops or awareness demos. It contains over 25 vulnerabilities
that an aspiring hacker can exploit in order to fulfil challenges that are tracked on a score-board.

The job of the e2e test suite is twofold:

1. It ensures that the overall functionality (e.g. logging in, placing products in the basket, submitting an order etc.) of the application is working. This is the above mentioned typical use case for e2e tests.
2. It performs attacks on the application that should solve all the existing challenges. This includes [SQL Injections](https://www.owasp.org/index.php/SQL_Injection), [Cross-Site Scripting](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)) attacks, business logic error exploits and many more.

When does Juice Shop pass its e2e test suite? When it is working fine for the average nice user __and__ all challenges are solvable, so an attacker can get a 100% on the score-board!

![Juice Shop logo](http://bkimminich.github.io/juice-shop/assets/JuiceShop_Logo.svg)

## Application Architecture

Juice Shop is created entirely in Javascript, with a Single-Page-Application frontend (using [AngularJS](https://angularjs.org) with [Bootstrap](http://getbootstrap.com)) and a RESTful backend using [Express](http://expressjs.com/) on top of [NodeJS](https://nodejs.org/).
The underlying database is a simple file-based [SQLite](https://www.sqlite.org/) with [Sequelize](http://sequelizejs.com/) as a OR-mapper and [sequelize-restful](https://github.com/sequelize/sequelize-restful) to generate the simple (but not necessarily secure) parts of the API dynamically.

## Test Stages

There three different types of of tests to make sure Juice Shop is not released in an _unintendedly_ broken state:

1. Unit tests make sure that the frontend services and controllers work how they should. The AngularJS services/controller are tested with [Karma](http://karma-runner.github.io/) and [Jasmine](http://jasmine.github.io/).
2. API tests verify the RESTful backend is behaving properly when running as a real server. These tests are done with Karma and [frisby.js](http://frisbyjs.com/) for orchestrating the API calls.
3. The e2e test suite performs typical use cases and all kinds of attacks via browser-automation using [Protractor](https://angular.github.io/protractor) and Jasmine.

If all stages pass and the application survives a quick monkey-test by yours truly it will be released on [GitHub](https://github.com/bkimminich/juice-shop/releases) and [SourceForge](http://sourceforge.net/projects/juice-shop/).

## Why Sauce Labs?

There are two reasons to run [Juice Shop tests on Sauce Labs](https://saucelabs.com/u/juice-shop):

1. Seeing the frontend unit tests pass on a laptop already gives a good feeling for an upcoming release. But there they run only on PhantomJS, so not in a real browser. Seeing them pass on various browsers increases confidence in the release.
2. The e2e tests must be executed before shipping a release. Wanting to make sure they are not skipped due to laziness or overconfidence (_"Oh' it's such a small fix, what could it possibly break?"_ - Sounds familiar?) the e2e suite
must be integrated into the CI pipeline.

Having laid out the context the rest of the article will explain how both these goals could be achieved by integrating with Sauce Labs.

### Execution via Travis-CI

[Juice Shop builds on Travis-CI](https://travis-ci.org/bkimminich/juice-shop) which Sauce Labs integrates nicely with out of the box. The following snippet from the [.travis.yml](https://github.com/bkimminich/juice-shop/blob/master/.travis.yml) shows the necessary configuration
and the two commands being called to excecute unit and e2e tests.

    addons:
      sauce_connect: true
	after_success:
    - karma start karma.conf-ci.js
    - node test/e2eTests.js
    env:
      global:
      - secure: <your encrypted SAUCE_USERNAME>
      - secure: <your encrypted SAUCE_ACCESS_KEY>

### Frontend Unit Tests

The [karma.conf-ci.js](https://github.com/bkimminich/juice-shop/blob/master/karma.conf-ci.js) contains the configuration for the frontend unit tests. Juice Shop uses six different OS/Browser configurations:

    var customLaunchers = {
        sl_chrome: {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform : 'Linux',
            version: '37'
        },
        sl_firefox: {
            base: 'SauceLabs',
            browserName: 'firefox',
            platform: 'Linux',
            version: '33'
        },
        sl_ie_11: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 8.1',
            version: '11'
        },
        sl_ie_10: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 8',
            version: '10'
        },
        sl_ie_9: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '9'
        },
        sl_safari: {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'OS X 10.9',
            version: '7'
        }
    };

In order associate the test executions with the Travis-CI build that triggered them, some extra configuration is necessary:

        sauceLabs: {
            testName: 'Juice-Shop Unit Tests (Karma)',
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY,
            connectOptions: {
                tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
                port: 4446
            },
            build: process.env.TRAVIS_BUILD_NUMBER,
            tags: [process.env.TRAVIS_BRANCH, process.env.TRAVIS_BUILD_NUMBER, 'unit'],
            recordScreenshots: false
        }
        reporters: ['dots', 'saucelabs']

Thanks to the existing `karma-sauce-launcher` module the tests are executed and their result is reported back to Sauce Labs out of the box. Nice. The e2e suite was a tougher nut to crack.

### End-to-end Tests

For the Protractor e2e tests there are no separate configuration files for local and CI, just one [protractor.conf.js](https://github.com/bkimminich/juice-shop/blob/master/protractor.conf.js) with some extra
settings then running on Travis-CI to pass necessary data to Sauce Labs:

	if (process.env.TRAVIS_BUILD_NUMBER) {
		exports.config.seleniumAddress = 'http://localhost:4445/wd/hub';
		exports.config.capabilities = {
			'name': 'Juice-Shop e2e Tests (Protractor)',
			'browserName': 'chrome',
			'platform': 'Windows 7',
			'screen-resolution': '1920x1200',
			'username': process.env.SAUCE_USERNAME,
			'accessKey': process.env.SAUCE_ACCESS_KEY,
			'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
			'build': process.env.TRAVIS_BUILD_NUMBER,
			'tags': [process.env.TRAVIS_BRANCH, process.env.TRAVIS_BUILD_NUMBER, 'e2e']
		};
	}

The e2e tests are launched via [e2eTests.js](https://github.com/bkimminich/juice-shop/blob/master/test/e2eTests.js) which spawns a separate process for Protractor after launching the Juice Shop server:

	var spawn = require('win-spawn'),
		SauceLabs = require('saucelabs'),
		colors = require('colors/safe'),
		server = require('./../server.js');

	server.start({ port: 3000 }, function () {
		var protractor = spawn('protractor', [ 'protractor.conf.js' ]);

		function logToConsole(data) {
			console.log(String(data));
		}

		protractor.stdout.on('data', logToConsole);
		protractor.stderr.on('data', logToConsole);

		protractor.on('exit', function (exitCode) {
			console.log('Protractor exited with code ' + exitCode + ' (' + (exitCode === 0 ? colors.green('SUCCESS') : colors.red('FAILED')) + ')');
			if (process.env.TRAVIS_BUILD_NUMBER && process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
				setSaucelabJobResult(exitCode);
			} else {
				server.close(exitCode);
			}
		});
	});
	
The interesting part regarding Sauce Labs is the call to `setSaucelabJobResult(exitCode)` in case the test is run on Travis-CI with Sauce Labs credentials which are passed in by the extra config part in [protractor.conf.js](https://github.com/bkimminich/juice-shop/blob/master/protractor.conf.js).
This function passes the test result from Protractor on to Sauce Lab's REST API:

	function setSaucelabJobResult(exitCode) {
		var sauceLabs = new SauceLabs({ username: process.env.SAUCE_USERNAME, password: process.env.SAUCE_ACCESS_KEY });
		sauceLabs.getJobs(function (err, jobs) {
			for (var j in jobs) {
				if (jobs.hasOwnProperty(j)) {
					sauceLabs.showJob(jobs[j].id, function (err, job) {
						var tags = job.tags;
						if (tags.indexOf(process.env.TRAVIS_BUILD_NUMBER) > -1 && tags.indexOf('e2e') > -1) {
							sauceLabs.updateJob(job.id, { passed : exitCode === 0 }, function(err, res) {
								console.log('Marked job ' + job.id + ' for build #' + process.env.TRAVIS_BUILD_NUMBER + ' as ' + (exitCode === 0 ? colors.green('PASSED') : colors.red('FAILED')) + '.');
								server.close(exitCode);
							});
						}
					});
				}
			}
		});
	}

This was necessary because there was no launcher available at the time that would do this out-of-the-box.

## Determining solved Challenges

How does Protractor get its test result in the first place? It must be able to determine if all challenges were solved on the score board and cannot access the database directly to do that. But: It can access
the score board in the application:

![Screenshot score board](http://bkimminich.github.io/juice-shop/assets/scoreboard.png)

As solved challenges are highlighted green instead of red some simple generic function was used to assert this:

	protractor.expect = {
		challengeSolved: function (context) {
			describe("(shared)", function () {

				beforeEach(function () {
					browser.get('/#/score-board');
				});

				it("challenge '" + context.challenge + "' should be solved on score board", function () {
					expect(element(by.id(context.challenge + '.solved')).getAttribute('class')).not.toMatch('ng-hide');
					expect(element(by.id(context.challenge + '.notSolved')).getAttribute('class')).toMatch('ng-hide');
				});

			});
		}
	}

When watching the e2e suite run Protractor will constantly visit the score board to check each challenge. This is quite interesting to watch as the progress bar on top moves closer to 100% with every test. But be
warned: If you plan on trying to hack away on [Juice Shop](http://bkimminich.github.io/juice-shop/) to solve all the challenges yourself, you will find the following screencast to be quite a spoiler! ;-)

<iframe title="juice-shop hacking challenges solved by Protractor e2e tests (v1.5.4)" width="560" height="315" src="https://www.youtube.com/embed/CXsWFkzS8Ag" frameborder="0" allowfullscreen></iframe>