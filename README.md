# ![Juice Shop Logo](https://raw.githubusercontent.com/bkimminich/juice-shop/master/app/public/images/JuiceShop_Logo_50px.png) OWASP Juice Shop [![OWASP Labs](https://img.shields.io/badge/owasp-incubator-blue.svg)](https://www.owasp.org/index.php/OWASP_Project_Inventory#tab=Incubator_Projects) [![GitHub release](https://img.shields.io/github/release/bkimminich/juice-shop.svg)](https://github.com/bkimminich/juice-shop/releases/latest) [![Twitter Follow](https://img.shields.io/twitter/follow/owasp_juiceshop.svg?style=social&label=Follow)](https://twitter.com/owasp_juiceshop)

[![Build Status](https://travis-ci.org/bkimminich/juice-shop.svg?branch=master)](https://travis-ci.org/bkimminich/juice-shop)
[![Build status](https://ci.appveyor.com/api/projects/status/903c6mnns4t7p6fa/branch/master?svg=true)](https://ci.appveyor.com/project/bkimminich/juice-shop/branch/master)
[![Test Coverage](https://codeclimate.com/github/bkimminich/juice-shop/badges/coverage.svg)](https://codeclimate.com/github/bkimminich/juice-shop)
[![Code Climate](https://codeclimate.com/github/bkimminich/juice-shop/badges/gpa.svg)](https://codeclimate.com/github/bkimminich/juice-shop)
[![bitHound Overall Score](https://www.bithound.io/github/bkimminich/juice-shop/badges/score.svg)](https://www.bithound.io/github/bkimminich/juice-shop)

> [The most trustworthy online shop out there.](https://twitter.com/dschadow/status/706781693504589824)
> ([@dschadow](https://github.com/dschadow))

OWASP Juice Shop is an intentionally insecure web app for security
trainings written entirely in Javascript which encompasses the entire
[OWASP Top Ten](https://www.owasp.org/index.php/OWASP_Top_Ten) and other
severe security flaws.

## Description

Juice Shop is written in Node.js, Express and AngularJS. It was the
first application written entirely in JavaScript listed in the
[OWASP VWA Directory](https://www.owasp.org/index.php/OWASP_Vulnerable_Web_Applications_Directory_Project).

The application contains over 30 challenges of varying difficulty where
the user is supposed to exploit the underlying vulnerabilities. The
hacking progress is tracked on a score board. Finding this score board
is actually one of the (easy) challenges!

Apart from the hacker and awareness training use case, pentesting
proxies or security scanners can use Juice Shop as a "guinea
pig"-application to check how well their tools cope with
Javascript-heavy application frontends and REST APIs.

> Translating "dump" or "useless outfit" into German yields "Saftladen"
> which can be reverse-translated word by word into "juice shop". Hence
> the project name. That the initials "JS" match with those of
> "Javascript" was purely coincidental!

## Main Selling Points

- Easy-to-install: Choose between
  [node.js](#nodejs-version-compatibility),
  [Docker](https://www.docker.com) and
  [Vagrant](https://www.vagrantup.com/downloads.html) to run on
  Windows/Mac/Linux
- Self-contained: Additional dependencies are pre-packaged or will be
  resolved and downloaded automatically
- Self-healing: The simple SQLite database is wiped and regenerated from
  scratch on every server startup
- Gamification: The application notifies you on solved challenges and
  keeps track of successfully exploited vulnerabilities on a Score Board
- CTF-support: Challenge notifications optionally show a flag code for
  your own
  [Capture-The-Flag events](https://github.com/bkimminich/juice-shop-ctf)
- Re-branding: Fully customizable business context and look & feel
- Free and Open source: Licensed under the [MIT license](LICENSE) with
  no hidden costs or caveats

## Application Architecture

![Juice Shop Architecture](https://raw.githubusercontent.com/bkimminich/juice-shop/gh-pages/assets/Architektur_JuiceShop.png)

## Preview [![Heroku](https://heroku-badge.herokuapp.com/?app=juice-shop)](https://juice-shop.herokuapp.com)

Feel free to have a look at the latest version of OWASP Juice Shop:
<https://juice-shop.herokuapp.com>

> This is a deployment-test and sneak-peek instance only! You are __not
> supposed__ to use this instance for your own hacking endeavours! No
> guaranteed uptime! Guaranteed stern looks if you break it!

## Setup

### Deploy on Heroku (free ($0/month) dyno)

1. Click the button below and follow the instructions

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

> This is the quickest way to get a running instance of Juice Shop! If
> you have forked this repository, the deploy button will automatically
> pick up your fork for deployment! As long as you do not perform any
> DDoS attacks you are free to use any tools or scripts to hack your
> Juice Shop instance on Heroku!

### From Sources

1. Install [node.js](#nodejs-version-compatibility)
2. Run `git clone https://github.com/bkimminich/juice-shop.git` (or
   clone [your own fork](https://github.com/bkimminich/juice-shop/fork)
   of the repository)
3. Run `npm install` (only has to be done before first start or when you
   change the source code)
4. Run `npm start`
5. Browse to <http://localhost:3000>

### Docker Container [![Docker Automated build](https://img.shields.io/docker/automated/bkimminich/juice-shop.svg)](https://registry.hub.docker.com/u/bkimminich/juice-shop/) [![Docker Pulls](https://img.shields.io/docker/pulls/bkimminich/juice-shop.svg)](https://registry.hub.docker.com/u/bkimminich/juice-shop/)

1. Install [Docker](https://www.docker.com)
2. Run `docker pull bkimminich/juice-shop`
3. Run `docker run -d -p 3000:3000 bkimminich/juice-shop`
4. Browse to <http://localhost:3000> (on macOS browse to
   <http://192.168.99.100:3000> instead)

#### Even easier: Run Docker Container from Docker Toolbox (Kitematic)

1. Install and launch
   [Docker Toolbox](https://www.docker.com/docker-toolbox)
2. Search for `juice-shop` and click _Create_ to download image and run
   container
3. Click on the _Open_ icon next to _Web Preview_ to browse to OWASP
   Juice Shop

### Packaged Distributions [![GitHub release](https://img.shields.io/github/downloads/bkimminich/juice-shop/total.svg)](https://github.com/bkimminich/juice-shop/releases/latest) [![SourceForge](https://img.shields.io/sourceforge/dt/juice-shop.svg)](https://sourceforge.net/projects/juice-shop/)

1. Install a 64bit [node.js](#nodejs-version-compatibility) on your
   Windows (or Linux) machine
2. Download `juice-shop-<version>_<node-version>_<os>_x64.zip` (or
   `.tgz`) attached to
   [latest release](https://github.com/bkimminich/juice-shop/releases/latest)
3. Unpack and run `npm start` in unpacked folder
4. Browse to <http://localhost:3000>

> Each packaged distribution includes some binaries for SQLite bound to
> the OS and node.js version which `npm install` was executed on.

### Amazon EC2 Instance

1. Setup an _Amazon Linux AMI_ instance
2. In _Step 3: Configure Instance Details_ unfold _Advanced Details_ and
   copy the script below into _User Data_
3. In _Step 6: Configure Security Group_ add a _Rule_ that opens port 80
   for HTTP
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

> Technically Amazon could view hacking activity on any EC2 instance as
> an attack on their AWS infrastructure! We highly discourage aggressive
> scanning or automated brute force attacks! You have been warned!

### Vagrant

1. Install [Vagrant](https://www.vagrantup.com/downloads.html) and
   [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
2. Run `git clone https://github.com/bkimminich/juice-shop.git` (or
   clone [your own fork](https://github.com/bkimminich/juice-shop/fork)
   of the repository)
3. Run `cd vagrant && vagrant up`
4. Browse to <http://juice.sh>

## Customization

Via a YAML configuration file in `/config`, the OWASP Juice Shop can be
customized in its content and look & feel. Please refer to
[CUSTOMIZATION.md](CUSTOMIZATION.md) for detailed instructions and
examples.

## Node.js version compatibility

OWASP Juice Shop officially supports the following versions of
[node.js](http://nodejs.org) and offers Docker images and packaged
distributions accordingly:

| node.js | [Docker images](https://registry.hub.docker.com/u/bkimminich/juice-shop) | Docker snapshots                                         | [Packaged distributions](https://github.com/bkimminich/juice-shop/releases/latest)       |
|:--------|:-------------------------------------------------------------------------|:---------------------------------------------------------|:-----------------------------------------------------------------------------------------|
| 4.x     | `node4`                                                                  | `node4-snapshot`, `node4-develop`                        | `juice-shop-<version>_node4_windows_x64.zip`, `juice-shop-<version>_node4_linux_x64.tgz` |
| __6.x__ | __`latest`__, `node6`                                                    | `snapshot`, `develop`, `node6-snapshot`, `node6-develop` | `juice-shop-<version>_node6_windows_x64.zip`, `juice-shop-<version>_node6_linux_x64.tgz` |
| 7.x     | `node7`                                                                  | `node7-snapshot`, `node7-develop`                        | `juice-shop-<version>_node7_windows_x64.zip`, `juice-shop-<version>_node7_linux_x64.tgz` |

> The stable Docker images are built from `master` while the snapshot
> images are built from `develop` branch. The latter contain unreleased
> features but cannot be considered stable.

## Additional Documentation

### Pwning OWASP Juice Shop [![Write Goodreads Review](https://img.shields.io/badge/goodreads-write%20review-382110.svg)](https://www.goodreads.com/review/edit/33834308)

This is the official companion guide to the OWASP Juice Shop. It will
give you a complete overview of the vulnerabilities found in the
application including hints how to spot and exploit them. In the
appendix you will even find complete step-by-step solutions to every
challenge.
[Pwning OWASP Juice Shop](https://www.gitbook.com/book/bkimminich/pwning-owasp-juice-shop)
is published with [GitBook](https://github.com/GitbookIO) under
[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)
and is available **for free** in HTML, PDF, Kindle and ePub format.

[![Pwning OWASP Juice Shop Cover](https://raw.githubusercontent.com/bkimminich/pwning-juice-shop/master/cover_small.jpg)](https://www.gitbook.com/book/bkimminich/pwning-owasp-juice-shop)

### Slide Decks

* [Introduction Slide Deck](http://bkimminich.github.io/juice-shop) in
  HTML5
* [PDF of the Intro Slide Deck](http://de.slideshare.net/BjrnKimminich/juice-shop-an-intentionally-insecure-javascript-web-application)
  on Slideshare

## Troubleshooting [![Gitter](http://img.shields.io/badge/gitter-join%20chat-1dce73.svg)](https://gitter.im/bkimminich/juice-shop)

If you need help with the application setup please check the
[TROUBLESHOOTING.md](TROUBLESHOOTING.md) or post your specific problem
or question in the
[official Gitter Chat](https://gitter.im/bkimminich/juice-shop).

## Contributing [![GitHub contributors](https://img.shields.io/github/contributors/bkimminich/juice-shop.svg)](https://github.com/bkimminich/juice-shop/graphs/contributors) [![HuBoard](http://img.shields.io/badge/Hu-Board-blue.svg)](https://huboard.com/bkimminich/juice-shop) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Found a bug? Crashed the app? Broken challenge? Found a vulnerability
that is not on the Score Board?

Feel free to
[create an issue](https://github.com/bkimminich/juice-shop/issues) or
[post your ideas in the chat](https://gitter.im/bkimminich/juice-shop)!
Pull requests are also highly welcome - please refer to
[CONTRIBUTING.md](CUSTOMIZATION.md) for details.

## References

Did you write a blog post, magazine article or do a podcast about or
mentioning OWASP Juice Shop? Or maybe you held or joined a conference
talk or meetup session, a hacking workshop or public training where this
project was mentioned?

Add it to our ever-growing list of [REFERENCES.md](REFERENCES.md) by
forking and opening a Pull Request!

## Merchandise

* On [Spreadshirt.com](http://shop.spreadshirt.com/juiceshop) and
  [Spreadshirt.de](http://shop.spreadshirt.de/juiceshop) you can get
  some swag (Shirts, Hoodies, Mugs) with the official OWASP Juice Shop
  logo
* On
  [Stickermule.com](https://www.stickermule.com/user/1070702817/stickers)
  you can get four variants of the OWASP Juice Shop logo to decorate
  your laptop

> An alternative way to get stickers (and maybe even a pin-back button)
> is to somehow [contribute to the project](CUSTOMIZATION.md) by fixing
> an issue, finding a serious bug or submitting a good idea for a new
> challenge! We're also happy to send some stickers your way if you
> organize a meetup or conference talk where you use or mention OWASP
> Juice Shop! Just contact the project leader to discuss your plans:
> bjoern.kimminich@owasp.org!

## Donations

### PayPal [![PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=paypal%40owasp%2eorg&lc=BM&item_name=OWASP%20Juice%20Shop&item_number=OWASP%20Foundation&no_note=0&currency_code=USD&bn=PP%2dDonationsBF)

PayPal donations via above button go to the OWASP Foundations and are
earmarked for "Juice Shop". This is the preferred way to support the
project.

### Others

[![Flattr](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub)
[![Gratipay](http://img.shields.io/gratipay/team/juice-shop.svg)](https://gratipay.com/juice-shop)

[![Bitcoin](https://img.shields.io/badge/bitcoin-1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm-orange.svg)](https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm)
[![Dash](https://img.shields.io/badge/dash-Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW-blue.svg)](https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW)
[![Ether](https://img.shields.io/badge/ether-0x0f933ab9fcaaa782d0279c300d73750e1311eae6-lightgrey.svg)](https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6)

## Credits

Inspired by the "classic"
[BodgeIt Store](https://github.com/psiinon/bodgeit) by
[@psiinon](https://github.com/psiinon).

## Contributors
Ordered by date of first contribution. [Auto-generated](https://github.com/dtrejo/node-authors) on Wed, 19 Apr 2017 08:32:58 GMT.

- [Björn Kimminich](https://github.com/bkimminich) aka `bkimminich`
- [Bitdeli Chef](https://github.com/bitdeli-chef) aka `bitdeli-chef`
- [The Gitter Badger](https://github.com/gitter-badger) aka `gitter-badger`
- [Aaron Edwards](https://github.com/aaron-m-edwards) aka `aaron-m-edwards`
- [Alec Brooks](https://github.com/alecbrooks) aka `alecbrooks`
- [Dinis Cruz](https://github.com/DinisCruz) aka `DinisCruz`
- [Timo Pagel](https://github.com/wurstbrot) aka `wurstbrot`
- [Gorka Vicente](https://github.com/gorkavicente) aka `gorkavicente`
- [Alvaro Viebrantz](https://github.com/alvarowolfx) aka `alvarowolfx`
- [Johanna A](https://github.com/yuhama) aka `yuhama`
- [Stephen OBrien](https://github.com/stephenobrien) aka `stephenobrien`
- [Joe Butler](https://github.com/joelicious) aka `joelicious`
- [Abhishek bundela](https://github.com/abhishekbundela) aka `abhishekbundela`
- [ninoseki](https://github.com/ninoseki)
- [Jannik Hollenbach](https://github.com/J12934) aka `J12934`

## Licensing [![license](https://img.shields.io/github/license/bkimminich/juice-shop.svg)](LICENSE)

This program is free software: you can redistribute it and/or modify it
under the terms of the [MIT license](LICENSE). OWASP Juice Shop and any
contributions are Copyright © by Bjoern Kimminich 2014-2017.

![Juice Shop Logo](https://raw.githubusercontent.com/bkimminich/juice-shop/master/app/public/images/JuiceShop_Logo.png)
