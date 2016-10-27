# ![Juice Shop Logo](https://raw.githubusercontent.com/bkimminich/juice-shop/master/app/public/images/JuiceShop_Logo_50px.png) OWASP Juice Shop [![OWASP Labs](https://img.shields.io/badge/owasp-incubator-blue.svg)](https://www.owasp.org/index.php/OWASP_Project_Inventory#tab=Incubator_Projects) [![Twitter Follow](https://img.shields.io/twitter/follow/owasp_juiceshop.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/owasp_juiceshop)

[![Build Status](https://travis-ci.org/bkimminich/juice-shop.svg?branch=master)](https://travis-ci.org/bkimminich/juice-shop) [![Build status](https://ci.appveyor.com/api/projects/status/903c6mnns4t7p6fa/branch/master?svg=true)](https://ci.appveyor.com/project/bkimminich/juice-shop/branch/master) [![Test Coverage](https://codeclimate.com/github/bkimminich/juice-shop/badges/coverage.svg)](https://codeclimate.com/github/bkimminich/juice-shop) [![Code Climate](https://codeclimate.com/github/bkimminich/juice-shop/badges/gpa.svg)](https://codeclimate.com/github/bkimminich/juice-shop) [![Sauce Test Status](https://saucelabs.com/buildstatus/juice-shop)](https://saucelabs.com/u/juice-shop) [![bitHound Overall Score](https://www.bithound.io/github/bkimminich/juice-shop/badges/score.svg)](https://www.bithound.io/github/bkimminich/juice-shop)

> [The most trustworthy online shop out there.](https://twitter.com/dschadow/status/706781693504589824) ([@dschadow](https://github.com/dschadow))

OWASP Juice Shop is an intentionally insecure webapp for security trainings written entirely in Javascript which encompasses the entire [OWASP Top Ten](https://www.owasp.org/index.php/OWASP_Top_Ten) and other severe security flaws.

## Description

Juice Shop is written in Node.js, Express and AngularJS. It was the first application written entirely in JavaScript listed in the [OWASP VWA Directory](https://www.owasp.org/index.php/OWASP_Vulnerable_Web_Applications_Directory_Project).

The application contains over 30 challenges of varying difficulty where the user is supposed to exploit the underlying vulnerabilities. The hacking progress is tracked on a score board. Finding this score board is actually one of the (easy) challenges!

Apart from the hacker and awareness training use case, pentesting proxies or security scanners can use Juice Shop as a "guinea pig"-application to check how well their tools cope with Javascript-heavy application frontends and REST APIs.

> Translating "dump" or "useless outfit" into German yields "Saftladen" which can be reverse-translated word by word into "juice shop". Hence the project name. That the initials "JS" match with those of "Javascript" was purely coincidental!

## Main Selling Points

- Easy-to-install: Choose between [node.js](http://nodejs.org)\*, [Docker](https://www.docker.com) and [Vagrant](https://www.vagrantup.com/downloads.html) to run on Windows/Mac/Linux
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

1. Install [node.js](http://nodejs.org)\*
2. Run `git clone https://github.com/bkimminich/juice-shop.git` (or clone [your own fork](https://github.com/bkimminich/juice-shop/fork) of the repository)
3. Run `npm install` (only has to be done before first start or when you change the source code)
4. Run `npm start`
5. Browse to <http://localhost:3000>

### Docker Container [![Docker](http://img.shields.io/badge/docker-bkimminich%2Fjuice--shop-blue.svg)](https://registry.hub.docker.com/u/bkimminich/juice-shop/)

1. Install [Docker](https://www.docker.com)
2. Run `docker pull bkimminich/juice-shop`
3. Run `docker run -d -p 3000:3000 bkimminich/juice-shop`
4. Browse to <http://localhost:3000> (on OSX browse to <http://192.168.99.100:3000> instead)

#### Even easier: Run Docker Container from Docker Toolbox (Kitematic)

1. Install and launch [Docker Toolbox](https://www.docker.com/docker-toolbox)
2. Search for `juice-shop` and click _Create_ to download image and run container
3. Click on the _Open_ icon next to _Web Preview_ to browse to OWASP Juice Shop

### Packaged Distributions [![GitHub release](https://img.shields.io/github/downloads/bkimminich/juice-shop/total.svg)](https://github.com/bkimminich/juice-shop/releases/latest) [![SourceForge](https://img.shields.io/sourceforge/dt/juice-shop.svg)](https://sourceforge.net/projects/juice-shop/)

1. Install a [64bit node.js](https://nodejs.org/en/download)\* on your Windows (or Linux) machine
2. Download `juice-shop-<version>_<node-version>_<os>_x64.zip` (or `.tgz`) attached to [latest release](https://github.com/bkimminich/juice-shop/releases/latest)
3. Unpack and run `npm start` in unpacked folder
4. Browse to <http://localhost:3000>

> Each packaged distribution includes some binaries for SQLite bound to the OS and node.js version which `npm install` was executed on.

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
docker pull bkimminich/juice-shop
docker run -d -p 80:3000 bkimminich/juice-shop
```

> Technically Amazon could view hacking activity on any EC2 instance as an attack on their AWS infrastructure! We highly disrecommend aggressive scanning or automated brute force attacks! You have been warned!

### Vagrant

1. Install [Vagrant](https://www.vagrantup.com/downloads.html) and [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
2. Run ```cd vagrant && vagrant up```
3. Browse to <http://juice.sh>

## \*Node.js version compatibility

OWASP Juice Shop officially supports the following versions of [node.js](http://nodejs.org) and offers Docker images and packaged distributions accordingly:

node.js | Stable [Docker Image](https://registry.hub.docker.com/u/bkimminich/juice-shop) Tags | [Packaged Distributions](https://github.com/bkimminich/juice-shop/releases/latest)
------------ | ------------ | ------------
4.x | `node4` | `juice-shop-<version>_node4_windows_x64.zip`, `juice-shop-<version>_node4_linux_x64.tgz`  
__6.x__ | __`latest`__, `node6` | `juice-shop-<version>_node6_windows_x64.zip`, `juice-shop-<version>_node6_linux_x64.tgz`  
7.x | `node7` | `juice-shop-<version>_node7_windows_x64.zip`, `juice-shop-<version>_node7_linux_x64.tgz`  

> There are also Docker images built from the `develop` branch. These contain unreleased features but cannot be considered stable. For node.js 6.x there are the tag aliases `snapshot`, `develop`, `node6-snapshot` and `node6-develop`. For 4.x there are `node4-snapshot` and `node4-develop` and for 7.x `node7-snapshot` and `node7-develop` correspondingly.  

## Troubleshooting [![Gitter](http://img.shields.io/badge/gitter-join%20chat-1dce73.svg)](https://gitter.im/bkimminich/juice-shop)

> If you need help with the application setup please check the Troubleshooting section below or post your specific problem or question in the [official Gitter Chat](https://gitter.im/bkimminich/juice-shop).

- After changing to a different Node.js version it is a good idea to delete `npm_modules` and re-install all dependencies from scratch with `npm install`  
- If you are experiencing [Error 128](https://github.com/bower/bower/issues/50) from some GitHub repos during `bower install` execution, run `git config --global url."https://".insteadOf git://` and try `npm install` again
- If using Boot2Docker (Docker inside VirtualBox on Windows) make sure that you also enable port forwarding from Host `127.0.0.1:3000` to `0.0.0.0:3000` for TCP
- If `npm install` fails after an update of your local copy during `bower install` complaining about version issues, delete `/app/bower_components` and try again to remove outdated versions that cause conflicts
- If during `npm install` the `sqlite3` no binaries can be downloaded for your system, the setup falls back to building from source with `node-gyp`. Check the [`node-gyp` installation instructions](https://github.com/nodejs/node-gyp#installation) for additional tools you might need to install (e.g. Python 2.7, GCC, Visual C++ Build Tools etc.)  
- You may find it easier to find vulnerabilities using a pen test tool. I strongly recommend [Zed Attack Proxy](https://code.google.com/p/zaproxy/) which is open source and very powerful, yet beginner friendly.

## Contributing [![HuBoard](http://img.shields.io/badge/Hu-Board-blue.svg)](https://huboard.com/bkimminich/juice-shop) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Found a bug? Crashed the app? Broken challenge? Found a vulnerability that is not on the Score Board?

Feel free to [create an issue](https://github.com/bkimminich/juice-shop/issues) or [post your ideas in the chat](https://gitter.im/bkimminich/juice-shop)! Pull requests are also highly welcome - please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Project Media & Marketing

### Slide Decks

* [Introduction Slide Deck](http://bkimminich.github.io/juice-shop) in HTML5
* [Lightning Talk Slides](http://juice-shop-lightning-talk.kimminich.de) for a 10min runthrough
* [PDF of the Intro Slide Deck](http://de.slideshare.net/BjrnKimminich/juice-shop-an-intentionally-insecure-javascript-web-application) on Slideshare 

### Web Links

> Did you write a blog post, magazine article or do a podcast about or mentioning OWASP Juice Shop? Send a Pull Request so we can add it to the list! The same goes for conference or meetup talks, workshops or trainings you did where you included this project!

> :trollface: _indicates links that contain spoilers or solutions to at least one vulnerability challenge of the OWASP Juice Shop!_

* [7 Minute Security](https://7ms.us) Podcast:
  * Episode #229: [7MS #229: Intro to Docker for Pentesters](https://7ms.us/7ms-229-intro-to-docker-for-pentesters/) ([Youtube](https://youtu.be/WIpxvBpnylI?t=407))
  * Episode #230: [7MS #230: Pentesting OWASP Juice Shop - Part 1](https://7ms.us/7ms-230-pentesting-owasp-juice-shop-part-1/) ([Youtube](https://www.youtube.com/watch?v=Cz37iejTsH4)) :trollface:
  * Episode #231: [7MS #231: Pentesting OWASP Juice Shop - Part 2](https://7ms.us/7ms-231-pentesting-owasp-juice-shop-part-2/) ([Youtube](https://www.youtube.com/watch?v=523l4Pzhimc)) :trollface:
  * Episode #232: [7MS #232: Pentesting OWASP Juice Shop - Part 3](https://7ms.us/7ms-232-pentesting-owasp-juice-shop-part-3/) ([Youtube](https://www.youtube.com/watch?v=F8iRF2d-YzE)) :trollface:
  * Episode #233: [7MS #233: Pentesting OWASP Juice Shop - Part 4](https://7ms.us/7ms-233-pentesting-owasp-juice-shop-part-4/) ([Youtube](https://www.youtube.com/watch?v=1hhd9EwX7h0)) :trollface:
* German guest post on [Informatik Aktuell](http://www.informatik-aktuell.de/): [Juice Shop - Der kleine Saftladen für Sicherheitstrainings](http://www.informatik-aktuell.de/betrieb/sicherheit/juice-shop-der-kleine-saftladen-fuer-sicherheitstrainings.html)
* Guest post on [The official Sauce Labs Blog](http://sauceio.com/): [Proving that an application is as broken as intended](http://sauceio.com/index.php/2015/06/guest-post-proving-that-an-application-is-as-broken-as-intended/)
* Teaser post on [Björn Kimminich's Blog](http://kimminich.de): [Juice Shop](https://kimminich.wordpress.com/2015/06/15/juice-shop)

### Conference and Meetup Appearances

#### 2016

* [Lightning Talk: What's new in OWASP Juice Shop](), [German OWASP Day 2016](https://www.owasp.org/index.php/German_OWASP_Day_2016/), 29.11.2016
* [Gothenburg pwns the OWASP Juice Shop](), [OWASP Gothenburg Day 2016](https://owaspgbgday.se/), 24.11.2016
* [Hacking the OWASP Juice Shop](http://lanyrd.com/2016/owasp-nl/sffmpr/), [OWASP NL Chapter Meeting](http://lanyrd.com/2016/owasp-nl/), 22.09.2016 ([Youtube](https://www.youtube.com/watch?v=62Mj0ZgZvXc), :trollface: _in last 10min_)
* [Hacking-Session für Developer (und Pentester)](https://www.kieler-linuxtage.de/index.php?seite=programm.html#226), [Kieler Open Source und Linux Tage](https://www.kieler-linuxtage.de/index.php?seite=programm.html), 16.09.2016
* [Security-Auditing aus der Cloud – Softwareentwicklung kontinuierlich auf dem Prüfstand](http://www.sea-con.de/seacon2016/konferenz/konferenzprogramm/vortrag/do-41-2/title/security-auditing-aus-der-cloud-softwareentwicklung-kontinuierlich-auf-dem-pruefstand.html), [SeaCon 2016](http://www.sea-con.de/seacon2016), 12.05.2016
* [Hacking the Juice Shop ("So ein Saftladen!")](http://lanyrd.com/2016/javaland/sdtbph/), [JavaLand 2016](http://lanyrd.com/2016/javaland/), 08.03.2016
* [Hacking the JuiceShop! ("Hackt den Saftladen!")](http://lanyrd.com/2016/nodehamburg/sdxtch/), [node.HH Meetup: Security!](http://lanyrd.com/2016/nodehamburg/), 03.02.2016

#### 2015

* [Lightning Talk: Hacking the Juice Shop ("So ein Saftladen!")](http://lanyrd.com/2015/owasp-d2015/sdtzgg/), [German OWASP Day 2015](http://lanyrd.com/2015/owasp-d2015/), 01.12.2015
* [Juice Shop - Hacking an intentionally insecure Javascript Web Application](http://lanyrd.com/2015/jsunconf/sdmpzk/), [JS Unconf 2015](http://lanyrd.com/2015/jsunconf/), 25.04.2015
* [So ein Saftladen! - Hacking Session für Developer (und Pentester)](http://lanyrd.com/2015/owasp-de/sdhctr/), [17. OWASP Stammtisch Hamburg](http://lanyrd.com/2015/owasp-de/), 27.01.2015

### Merchandise

* On [Spreadshirt.com](http://shop.spreadshirt.com/juiceshop)  and [Spreadshirt.de](http://shop.spreadshirt.de/juiceshop) you can get some swag (Shirts, Hoodies, Mugs) with the official OWASP Juice Shop logo
* On [Stickermule.com](https://www.stickermule.com/user/1070702817/stickers) you can get four variants of the OWASP Juice Shop logo to decorate your laptop

> An alternative way to get stickers (and maybe even a pin-back button) is to somehow [contribute to the project](CONTRIBUTING.md) by fixing an issue, finding a serious bug or submitting a good idea for a new challenge! We're also happy to send some stickers your way if you organize a meetup or conference talk where you use or mention OWASP Juice Shop! Just contact the project leader to discuss your plans: bjoern.kimminich@owasp.org!

## Donations
 
### PayPal [![PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=paypal%40owasp%2eorg&lc=BM&item_name=OWASP%20Juice%20Shop&item_number=OWASP%20Foundation&no_note=0&currency_code=USD&bn=PP%2dDonationsBF)


PayPal donations via above button go to the OWASP Foundations and are earmarked for "Juice Shop". This is the preferred way to support the project.

### Others

[![Flattr](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub) [![Gratipay](http://img.shields.io/gratipay/team/juice-shop.svg)](https://gratipay.com/juice-shop) [![Bitcoin](https://img.shields.io/badge/bitcoin-1FXJq5yVANLzR6ZWfqPKhJU3zWT3apnxmN-orange.svg)](https://blockchain.info/address/1FXJq5yVANLzR6ZWfqPKhJU3zWT3apnxmN)  


## Credits

Inspired by the "classic" [BodgeIt Store](https://github.com/psiinon/bodgeit) by [@psiinon](https://github.com/psiinon).

## Licensing

This program is free software: you can redistribute it and/or modify it under the terms of the [MIT license](LICENSE). OWASP Juice Shop and any contributions are Copyright © by Bjoern Kimminich 2014-2016.

![Juice Shop Logo](https://raw.githubusercontent.com/bkimminich/juice-shop/master/app/public/images/JuiceShop_Logo.png)
