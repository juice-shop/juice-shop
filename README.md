# ![Juice Shop Logo](https://raw.githubusercontent.com/bkimminich/juice-shop/master/app/public/images/JuiceShop_Logo_50px.png) OWASP Juice Shop

[![Build Status](https://travis-ci.org/bkimminich/juice-shop.svg?branch=master)](https://travis-ci.org/bkimminich/juice-shop) [![Build status](https://ci.appveyor.com/api/projects/status/903c6mnns4t7p6fa/branch/master?svg=true)](https://ci.appveyor.com/project/bkimminich/juice-shop/branch/master) [![Test Coverage](https://codeclimate.com/github/bkimminich/juice-shop/badges/coverage.svg)](https://codeclimate.com/github/bkimminich/juice-shop) [![Code Climate](https://codeclimate.com/github/bkimminich/juice-shop/badges/gpa.svg)](https://codeclimate.com/github/bkimminich/juice-shop) [![Sauce Test Status](https://saucelabs.com/buildstatus/juice-shop)](https://saucelabs.com/u/juice-shop)

> [The most trustworthy online shop out there.](https://twitter.com/dschadow/status/706781693504589824) ([@dschadow](https://github.com/dschadow))

OWASP Juice Shop is an intentionally insecure webapp for security trainings written entirely in Javascript which encompasses the entire [OWASP Top Ten](OWASP Juice Shop is an intentionally insecure webapp for security trainings written entirely in Javascript which encompasses the entire [OWASP Top Ten](https://www.owasp.org/index.php/OWASP_Top_Ten) and other severe security flaws.

## Description

Juice Shop is written in Node.js, Express and AngularJS. It was the first application written entirely in JavaScript listed in the [OWASP VWA Directory](https://www.owasp.org/index.php/OWASP_Vulnerable_Web_Applications_Directory_Project).

The application contains 28+ challenges of varying difficulty where the user is supposed to exploit the underlying vulnerabilities. The hacking progress is tracked on a score board. Finding this score board is actually one of the (easy) challenges!

Apart from the hacker and awareness training use case, pentesting proxies or security scanners can use Juice Shop as a "guinea pig"-application to check how well their tools cope with Javascript-heavy application frontends and REST APIs.

> Translating "dump" or "useless outfit" into German yields "Saftladen" which can be reverse-translated word by word into "juice shop". Hence the project name. That the initials "JS" match with those of "Javascript" was purely coincidental!

## Main Selling Points

- Easy-to-install: Requires nothing but [node.js](http://nodejs.org)\* or [Docker](https://www.docker.com) to run on Windows/Mac/Linux
- Self-contained: Additional dependencies are pre-packaged or will be resolved and downloaded automatically
- Self-healing: The simple SQLite database is wiped and regenerated from scratch on every server startup
- Gamification: On a Score Board the application keeps track of successfully exploited vulnerabilities
- Free and Open source: Licensed under the [MIT license](LICENSE) with no hidden costs or caveats

## Application Architecture

![Juice Shop Architecture](https://github.com/bkimminich/juice-shop/blob/gh-pages/assets/Architektur_JuiceShop.png?raw=true)

## Preview [![Heroku](https://heroku-badge.herokuapp.com/?app=juice-shop)](https://juice-shop.herokuapp.com)

Feel free to have a look at the latest version of OWASP Juice Shop: <https://juice-shop.herokuapp.com>

> This is a deployment-test and sneak-peek instance only! You are __not supposed__ to use this instance for your own hacking endeavours! No guaranteed uptime! Guaranteed stern looks if you break it!

## Setup

### Deploy on Heroku (free ($0/month) dyno)

1. Click the button below and follow the instructions

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

> This is the quickest way to get a running instance of Juice Shop! If you have forked this repository, the deploy button will automatically pick up your fork for deployment! As long as you do not perform any DDoS attacks you are free to use any tools or scripts to hack your Juice Shop instance on Heroku!

### From Sources

1. Install [node.js 4.x or higher](http://nodejs.org)\*
2. Run ```git clone https://github.com/bkimminich/juice-shop.git``` (or clone [your own fork](https://github.com/bkimminich/juice-shop/fork) of the repository)
3. Run ```npm install``` (only has to be done before first start or when you change the source code)
4. Run ```npm start```
5. Browse to <http://localhost:3000>

### Docker Container [![Docker](http://img.shields.io/badge/docker-bkimminich%2Fjuice--shop-blue.svg)](https://registry.hub.docker.com/u/bkimminich/juice-shop/)

1. Install [Docker](https://www.docker.com)
2. Run ```docker pull bkimminich/juice-shop```
3. Run ```docker run -d -p 3000:3000 bkimminich/juice-shop```
4. Browse to <http://localhost:3000>

#### Even easier: Run Docker Container from Docker Toolbox (Kitematic)

1. Install and launch [Docker Toolbox](https://www.docker.com/docker-toolbox)
2. Search for ```juice-shop``` and click _Create_ to download image and run container
3. Click on the _Open_ icon next to _Web Preview_ to browse to OWASP Juice Shop

### Packaged Distributions [![GitHub release](https://img.shields.io/github/downloads/bkimminich/juice-shop/total.svg)](https://github.com/bkimminich/juice-shop/releases/latest) [![SourceForge](https://img.shields.io/sourceforge/dt/juice-shop.svg)](https://sourceforge.net/projects/juice-shop/)

1. Install a [64bit node.js 4.x, 5.x or 6.x](https://nodejs.org/en/download)\* on your Windows (or Linux) machine
2. Download ```juice-shop-<version>_<node-version>_<os>_x64.zip``` (or ```.tgz```) attached to [latest release](https://github.com/bkimminich/juice-shop/releases/latest)
3. Unpack and run ```npm start``` in unpacked folder
4. Browse to <http://localhost:3000>

> Each packaged distribution includes some binaries for SQLite bound to the OS and node.js version which ```npm install``` was executed on.

### Amazon EC2 Instance

1. Setup an _Amazon Linux AMI_ instance
2. In _Step 3: Configure Instance Details_ unfold _Advanced Details_ and copy the script below into _User Data_
3. In _Step 6: Configure Security Group_ add a _Rule_ that opens port 80 for HTTP
4. Launch instance
5. Browse to your instance's public DNS

```
#!/bin/bash
yum update -y
yum install -y docker
service docker start
docker pull bkimminich/juice-shop:latest
docker run -d -p 80:3000 bkimminich/juice-shop:latest
```

> Technically Amazon could view hacking activity on any EC2 instance as an attack on their AWS infrastructure! We highly disrecommend aggressive scanning or automated brute force attacks! You have been warned!

## \*Node.js version compatibility

OWASP Juice Shop officially supports the following versions of [node.js](http://nodejs.org):
- __4.x (recommended version)__
- 5.x
- 6.x

> Support for node.js 0.10, 0.11 and 0.12 has been dropped to reduce the complexity of the build matrix and get less timeouts from Sauce Labs during test execution.  

## Troubleshooting [![Gitter](http://img.shields.io/badge/gitter-join%20chat-1dce73.svg)](https://gitter.im/bkimminich/juice-shop)

> If you need help with the application setup please check the Troubleshooting section below or post your specific problem or question in the [official Gitter Chat](https://gitter.im/bkimminich/juice-shop).

- If you are experiencing [Error 128](https://github.com/bower/bower/issues/50) from some GitHub repos during ```bower_install.js``` execution, run ```git config --global url."https://".insteadOf git://``` and try ```npm install``` again
- If using Boot2Docker (Docker inside VirtualBox on Windows) make sure that you also enable port forwarding from Host ```127.0.0.1:3000``` to ```0.0.0.0:3000``` for TCP
- If ```npm install``` fails after an update of your local copy during ```bower_install.js``` complaining about version issues, delete ```/app/bower_components``` and try again to remove outdated versions that cause conflicts
- You may find it easier to find vulnerabilities using a pen test tool. I strongly recommend [Zed Attack Proxy](https://code.google.com/p/zaproxy/) which is open source and very powerful, yet beginner friendly.

## Contributions [![HuBoard](http://img.shields.io/badge/Hu-Board-blue.svg)](https://huboard.com/bkimminich/juice-shop)

Found a bug? Crashed the app? Broken challenge? Found a vulnerability that is not on the Score Board?

Feel free to [create an issue](https://github.com/bkimminich/juice-shop/issues) or [post your ideas in the chat](https://gitter.im/bkimminich/juice-shop)! Pull requests are also highly welcome as long as the tests still pass!

[![Dependency Status](https://gemnasium.com/bkimminich/juice-shop.svg)](https://gemnasium.com/bkimminich/juice-shop)
[![Dependency Status](https://www.versioneye.com/user/projects/544a2e5ac310f92c920000ec/badge.svg?style=flat)](https://www.versioneye.com/user/projects/544a2e5ac310f92c920000ec)
[![Dependency Status](https://david-dm.org/bkimminich/juice-shop.svg)](https://david-dm.org/bkimminich/juice-shop)
[![devDependency Status](https://david-dm.org/bkimminich/juice-shop/dev-status.svg)](https://david-dm.org/bkimminich/juice-shop#info=devDependencies)

> In case you are wondering about some red or yellow dependency badges: OWASP Juice Shop is _intentionally broken_, so [using components with known vulnerabilities](https://www.owasp.org/index.php/Top_10_2013-A9-Using_Components_with_Known_Vulnerabilities) is considered a _feature_!

### Unit Tests

There is a full suite containing independent unit tests for the client- and server-side code. These tests verify if the normal use cases of the application should work. All server-side vulnerabilities are also tested.

```
npm test
```

### End-to-end Tests

The e2e test suite verifies if all client- and server-side vulnerabilities are exploitable. It passes only when all challenges are solvable on the score board.

```
npm run protractor
```

> The e2e tests require a working internet connection in order to verify the redirect challenges!

## Project Media & Marketing

### Slide Decks

* [Introduction Slide Deck](http://bkimminich.github.io/juice-shop) in HTML5
* [Lightning Talk Slides](http://juice-shop-lightning-talk.kimminich.de) for a 10min runthrough
* [PDF of the Intro Slide Deck](http://de.slideshare.net/BjrnKimminich/juice-shop-an-intentionally-insecure-javascript-web-application) on Slideshare 

### Blog Links

* German guest post on [Informatik Aktuell](http://www.informatik-aktuell.de/): [Juice Shop - Der kleine Saftladen für Sicherheitstrainings](http://www.informatik-aktuell.de/betrieb/sicherheit/juice-shop-der-kleine-saftladen-fuer-sicherheitstrainings.html)
* Guest post on [The official Sauce Labs Blog](http://sauceio.com/): [Proving that an application is as broken as intended](http://sauceio.com/index.php/2015/06/guest-post-proving-that-an-application-is-as-broken-as-intended/)
* Teaser post on [Björn Kimminich's Blog](http://kimminich.de): [Juice Shop](https://kimminich.wordpress.com/2015/06/15/juice-shop)

### Conference and Meetup Appearances

* [Hacking the OWASP Juice Shop](http://lanyrd.com/2016/owasp-nl/sffmpr/), [OWASP NL Chapter Meeting](http://lanyrd.com/2016/owasp-nl/), 22.09.2016
* [Hacking the Juice Shop ("So ein Saftladen!")](http://lanyrd.com/2016/javaland/sdtbph/), [JavaLand 2016](http://lanyrd.com/2016/javaland/), 08.03.2016
* [Hacking the JuiceShop! ("Hackt den Saftladen!")](http://lanyrd.com/2016/nodehamburg/sdxtch/), [node.HH Meetup: Security!](http://lanyrd.com/2016/nodehamburg/), 03.02.2016
* [Lightning Talk: Hacking the Juice Shop ("So ein Saftladen!")](http://lanyrd.com/2015/owasp-d2015/sdtzgg/), [German OWASP Day 2015](http://lanyrd.com/2015/owasp-d2015/), 01.12.2015
* [Juice Shop - Hacking an intentionally insecure Javascript Web Application](http://lanyrd.com/2015/jsunconf/sdmpzk/), [JS Unconf 2015](http://lanyrd.com/2015/jsunconf/), 25.04.2015
* [So ein Saftladen! - Hacking Session für Developer (und Pentester)](http://lanyrd.com/2015/owasp-de/sdhctr/), [17. OWASP Stammtisch Hamburg](http://lanyrd.com/2015/owasp-de/), 27.01.2015

### Merchandise

* On [Spreadshirt.com](http://shop.spreadshirt.com/juiceshop)  and [Spreadshirt.de](http://shop.spreadshirt.de/juiceshop) you can get some swag (Shirts, Hoodies, Mugs) with the official OWASP Juice Shop logo
* On [Stickermule.com](https://www.stickermule.com/user/1070702817/stickers) you can get three variants of the OWASP Juice Shop logo to decorate your laptop

> An alternative way to get stickers and a button _for free_ is to somehow contribute to the project by fixing an issue, finding a serious bug or submitting a good idea for a new challenge! We're also happy to send some stickers your way if you organize a meetup or conference talk where you use or mention OWASP Juice Shop! Just contact the project leader to discuss your plans: bjoern.kimminich@owasp.org!

## Credits

Inspired by the "classic" [BodgeIt Store](https://github.com/psiinon/bodgeit) by [@psiinon](https://github.com/psiinon).

[![Gratipay](http://img.shields.io/gratipay/team/juice-shop.svg)](https://gratipay.com/juice-shop)
[![Bountysource](https://www.bountysource.com/badge/tracker?tracker_id=6283055)](https://www.bountysource.com/trackers/6283055-juice-shop?utm_source=6283055&utm_medium=shield&utm_campaign=TRACKER_BADGE)

## Licensing

This program is free software: you can redistribute it and/or modify it under the terms of the [MIT license](LICENSE). OWASP Juice Shop and any contributions are Copyright © by Bjoern Kimminich 2014-2016.

![Juice Shop Logo](https://raw.githubusercontent.com/bkimminich/juice-shop/master/app/public/images/JuiceShop_Logo.png)