# ![Juice Shop Logo](https://raw.githubusercontent.com/bkimminich/juice-shop/master/app/public/images/JuiceShop_Logo_100px.png) OWASP Juice Shop [![OWASP Labs](https://img.shields.io/badge/owasp-lab%20project-f7b73c.svg)](https://www.owasp.org/index.php/OWASP_Project_Inventory#tab=Labs_Projects) [![GitHub release](https://img.shields.io/github/release/bkimminich/juice-shop.svg)](https://github.com/bkimminich/juice-shop/releases/latest) [![Twitter Follow](https://img.shields.io/twitter/follow/owasp_juiceshop.svg?style=social&label=Follow)](https://twitter.com/owasp_juiceshop)

[![Build Status](https://travis-ci.org/bkimminich/juice-shop.svg?branch=master)](https://travis-ci.org/bkimminich/juice-shop)
[![Build status](https://ci.appveyor.com/api/projects/status/903c6mnns4t7p6fa/branch/master?svg=true)](https://ci.appveyor.com/project/bkimminich/juice-shop/branch/master)
[![Test Coverage](https://api.codeclimate.com/v1/badges/2a7af720d39b08a09904/test_coverage)](https://codeclimate.com/github/bkimminich/juice-shop/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/2a7af720d39b08a09904/maintainability)](https://codeclimate.com/github/bkimminich/juice-shop/maintainability)
[![Greenkeeper badge](https://badges.greenkeeper.io/bkimminich/juice-shop-ctf.svg)](https://greenkeeper.io/)

> [The most trustworthy online shop out there.](https://twitter.com/dschadow/status/706781693504589824)
> ([@dschadow](https://github.com/dschadow)) —
> [The best juice shop on the whole internet!](https://twitter.com/shehackspurple/status/907335357775085568)
> ([@shehackspurple](https://twitter.com/shehackspurple))

OWASP Juice Shop is an intentionally insecure web application written
entirely in JavaScript which encompasses the entire range of
[OWASP Top Ten](https://www.owasp.org/index.php/OWASP_Top_Ten) and other
severe security flaws.

![Juice Shop Screenshot Slideshow](screenshots/slideshow.gif)

For a detailed introduction, full list of features and architecture
overview please visit the official project page:
<http://owasp-juice.shop>

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
3. Go into the cloned folder with `cd juice-shop`
4. Run `npm install` (only has to be done before first start or when you
   change the source code)
5. Run `npm start`
6. Browse to <http://localhost:3000>

### Docker Container [![Docker Automated build](https://img.shields.io/docker/automated/bkimminich/juice-shop.svg)](https://registry.hub.docker.com/u/bkimminich/juice-shop/) [![Docker Pulls](https://img.shields.io/docker/pulls/bkimminich/juice-shop.svg)](https://registry.hub.docker.com/u/bkimminich/juice-shop/) [![](https://images.microbadger.com/badges/image/bkimminich/juice-shop.svg)](https://microbadger.com/images/bkimminich/juice-shop "Get your own image badge on microbadger.com") [![](https://images.microbadger.com/badges/version/bkimminich/juice-shop.svg)](https://microbadger.com/images/bkimminich/juice-shop "Get your own version badge on microbadger.com") [![](https://images.microbadger.com/badges/commit/bkimminich/juice-shop.svg)](https://microbadger.com/images/bkimminich/juice-shop "Get your own commit badge on microbadger.com")

1. Install [Docker](https://www.docker.com)
2. Run `docker pull bkimminich/juice-shop`
3. Run `docker run --rm -p 3000:3000 bkimminich/juice-shop`
4. Browse to <http://localhost:3000> (on macOS and Windows browse to
   <http://192.168.99.100:3000> if you are using docker-machine instead
   of the native docker installation)

> If you want to run Juice Shop on a Raspberry Pi 3, there is an
> unofficial Docker image available at
> <https://hub.docker.com/r/arclight/juice-shop_arm> which is based on
> `resin/rpi-raspbian` and maintained by
> [@battletux](https://github.com/battletux).

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
4. Browse to [192.168.33.10](http://192.168.33.10)

> To show the possible impact of
> [XSS](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)),
> assume you received and (of course) clicked
> [this inconspicuous phishing link](http://192.168.33.10/#/search?q=%3Cscript%3Evar%20js%20%3Ddocument.createElement%28%22script%22%29;js.type%20%3D%20%22text%2Fjavascript%22;js.src%3D%22http:%2F%2F192.168.33.10%2Fshake.js%22;document.body.appendChild%28js%29;varhash%3Dwindow.location.hash;window.location.hash%3Dhash.substr%280,8%29;%3C%2Fscript%3Eapple)
> and login. Apart from the visual/audible effect, the attacker also
> installed [an input logger](http://192.168.33.10/logger.php) to grab
> credentials! This could easily run on a 3rd party server in real life!
>
> _This feature is only available when running a Vagrant box. A
> recording of the effect is available on Youtube:_
> [:tv:](https://www.youtube.com/watch?v=L7ZEMWRm7LA)

## Node.js version compatibility

OWASP Juice Shop officially supports the following versions of
[node.js](http://nodejs.org) in line as close as possible with the
official [node.js LTS schedule](https://github.com/nodejs/LTS). Docker
images and packaged distributions are offered accordingly:

| node.js | [Docker image](https://registry.hub.docker.com/u/bkimminich/juice-shop)             | [Packaged distributions](https://github.com/bkimminich/juice-shop/releases/latest)       |
|:--------|:------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------|
| __9.x__ | __`latest`__ (current official release), `snapshot` (preview from `develop` branch) | `juice-shop-<version>_node9_windows_x64.zip`, `juice-shop-<version>_node9_linux_x64.tgz` |
| 8.x     |                                                                                     | `juice-shop-<version>_node8_windows_x64.zip`, `juice-shop-<version>_node8_linux_x64.tgz` |

## Demo [![Heroku](https://heroku-badge.herokuapp.com/?app=juice-shop)](http://demo.owasp-juice.shop)

Feel free to have a look at the latest version of OWASP Juice Shop:
<http://demo.owasp-juice.shop>

> This is a deployment-test and sneak-peek instance only! You are __not
> supposed__ to use this instance for your own hacking endeavours! No
> guaranteed uptime! Guaranteed stern looks if you break it!

## Customization

Via a YAML configuration file in `/config`, the OWASP Juice Shop can be
customized in its content and look & feel.

For detailed instructions and examples please refer to
[our _Customization_ documentation](https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part1/customization.html).

## CTF-Extension

If you want to run OWASP Juice Shop as a Capture-The-Flag event, we
recommend you set it up along with a [CTFd](https://ctfd.io) server
conveniently using the official
[`juice-shop-ctf-cli`](https://www.npmjs.com/package/juice-shop-ctf-cli)
tool.

For step-by-step instructions and examples please refer to
[the _Hosting a CTF event_ chapter](https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part1/ctf.html)
of our companion guide ebook.

## Additional Documentation

### Pwning OWASP Juice Shop [![Write Goodreads Review](https://img.shields.io/badge/goodreads-write%20review-382110.svg)](https://www.goodreads.com/review/edit/33834308)

This is the official companion guide to the OWASP Juice Shop. It will
give you a complete overview of the vulnerabilities found in the
application including hints how to spot and exploit them. In the
appendix you will even find complete step-by-step solutions to every
challenge. [Pwning OWASP Juice Shop](https://leanpub.com/juice-shop) is
published with
[GitBook](https://www.gitbook.com/book/bkimminich/pwning-owasp-juice-shop)
under
[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)
and is available **for free** in PDF, Kindle and ePub format. You can
also
[browse the full content online](https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content)!

[![Pwning OWASP Juice Shop Cover](https://raw.githubusercontent.com/bkimminich/pwning-juice-shop/master/cover_small.jpg)](https://leanpub.com/juice-shop)

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

## Contributing [![GitHub contributors](https://img.shields.io/github/contributors/bkimminich/juice-shop.svg)](https://github.com/bkimminich/juice-shop/graphs/contributors) [![Stories in Ready](https://badge.waffle.io/bkimminich/juice-shop.svg?label=ready&title=Ready)](http://waffle.io/bkimminich/juice-shop) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![Crowdin](https://d322cqt584bo4o.cloudfront.net/owasp-juice-shop/localized.svg)](https://crowdin.com/project/owasp-juice-shop) [![Bountysource Activity](https://img.shields.io/bountysource/team/juice-shop/activity.svg)](https://www.bountysource.com/teams/juice-shop)

We are always happy to get new contributors on board! Please check the
following table for possible ways to do so:

| :question:                                                                                            | :bulb:                                                                                                                                                                                                                                                                                   |
|:------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Found a bug? Crashed the app? Broken challenge? Found a vulnerability that is not on the Score Board? | [Create an issue](https://github.com/bkimminich/juice-shop/issues) or [post your ideas in the chat](https://gitter.im/bkimminich/juice-shop)                                                                                                                                             |
| Want to help with development? Pull requests are highly welcome!                                      | Please refer to the [_Contribute to development_](https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part3/contribution.html) and [_Codebase 101_](https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part3/codebase.html) chapters of our companion guide ebook |
| Want to help with internationalization?                                                               | Find out how to join our [Crowdin project](https://crowdin.com/project/owasp-juice-shop) in [the _Helping with translations_ documentation](https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part3/translation.html)                                                       |
| Anything else you would like to contribute?                                                           | Write an email to owasp_juice_shop_project@lists.owasp.org or bjoern.kimminich@owasp.org                                                                                                                                                                                                 |

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
  [StickerYou.com](https://www.stickeryou.com/products/owasp-juice-shop/794)
  you can get variants of the OWASP Juice Shop logo as single stickers
  to decorate your laptop with. They can also print magnets, iron-ons,
  sticker sheets and temporary tattoos.

The most honorable way to get some stickers is to
[contribute to the project](https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part3/contribution.html)
by fixing an issue, finding a serious bug or submitting a good idea for
a new challenge!

We're also happy to supply you with stickers if you organize a meetup or
conference talk where you use or talk about or hack the OWASP Juice
Shop! Just
[contact the mailing list](mailto:owasp_juice_shop_project@lists.owasp.org)
or [the project leader](mailto:bjoern.kimminich@owasp.org) to discuss
your plans! !

## Donations

### PayPal [![PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=paypal%40owasp%2eorg&lc=BM&item_name=OWASP%20Juice%20Shop%20Project&item_number=OWASP%20Foundation&no_note=0&currency_code=USD&bn=PP%2dDonationsBF)

PayPal donations via above button go to the OWASP Foundations and are
earmarked for "Juice Shop". This is the preferred and most convenient
way to support the project.

### Credit Card (through RegOnline)

OWASP hosts a
[donation form on RegOnline](https://www.regonline.com/Register/Checkin.aspx?EventID=1044369).
Refer to the
[Credit card donation step-by-step](https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part3/donations.html#credit-card-donation-step-by-step)
guide for help with filling out the donation form correctly.

### Crypto Currency

[![Bitcoin](https://img.shields.io/badge/bitcoin-1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm-orange.svg)](https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm)
[![Dash](https://img.shields.io/badge/dash-Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW-blue.svg)](https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW)
[![Ether](https://img.shields.io/badge/ether-0x0f933ab9fcaaa782d0279c300d73750e1311eae6-lightgrey.svg)](https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6)

## Contributors

### Collaborators

- [Björn Kimminich](https://github.com/bkimminich) aka `bkimminich`
  (Project Leader)
- [Jannik Hollenbach](https://github.com/J12934) aka `J12934`
- [Timo Pagel](https://github.com/wurstbrot) aka `wurstbrot`

### Code Contributors

Based on [GitHub](https://github.com/bkimminich/juice-shop) commits.
Ordered by added lines of code as of Sun, 12 Jan 2018 on `master`.

- [Viktor Lindström](https://github.com/ViktorLindstrm) aka
  `ViktorLindstrm`
- [Josh Grossman](https://github.com/tghosth) aka `tghosth`
- [Manabu Niseki](https://github.com/ninoseki) aka `ninoseki`
- [Gorka Vicente](https://github.com/gorkavicente) aka `gorkavicente`
- [Alvaro Viebrantz](https://github.com/alvarowolfx) aka `alvarowolfx`
- [Omer Levi Hevroni](https://github.com/omerlh) aka `omerlh`
- [m4l1c3](https://github.com/m4l1c3) aka `m4l1c3`
- [Johanna A](https://github.com/yuhama) aka `yuhama`
- [Aaron Edwards](https://github.com/aaron-m-edwards) aka
  `aaron-m-edwards`
- [Stephen OBrien](https://github.com/stephenobrien) aka `stephenobrien`
- [Jln Wntr](https://github.com/JlnWntr) aka `JlnWntr`
- [Greg Guthe](https://github.com/g-k) aka `g-k`
- [Abhishek bundela](https://github.com/abhishekbundela) aka
  `abhishekbundela`
- [Achim Grimm](https://github.com/achimgrimm) aka `achimgrimm`
- [battletux](https://github.com/battletux) aka `battletux`
- [Ingo Bente](https://github.com/ingben) aka `ingben`
- [Simon De Lang](https://github.com/simondel) aka `simondel`
- [AviD](https://github.com/avidouglen) aka `avidouglen`
- [Yuvraj](https://github.com/evalsocket) aka `evalsocket`
- [Stuart Winter-Tear](https://github.com/StuartWinterTear) aka
  `StuartWinterTear`
- [Christian Kühn](https://github.com/cy4n) aka `cy4n`
- [Dinis Cruz](https://github.com/DinisCruz) aka `DinisCruz`
- [Joe Butler](https://github.com/incognitjoe) aka `incognitjoe`

- [Shoeb Patel](https://github.com/CaptainFreak) aka `CaptainFreak`

### Translators

Based on [CrowdIn](https://crowdin.com/project/owasp-juice-shop)
translations and commits to `app/i18n`. Grouped by language as of Mon,
07 Jan 2018 on `master`.

- :cn: Coink, rToxic
- :czech_republic: Martin Hartl, stejkenzie
- :denmark: Allan Kimmer Jensen, owangen
- :estonia: bmoritz
- :fr: Kylian Runembert, vientspam
- :de: Björn Kimminich
- :hungary: OliverkeHU
- :indonesia: adeyosemanputra, bahrunghozali, kahfiehudson, Mohammad
  Febri Ramadlan, Rick Daalhuizen, Syahrol
- :israel: AviD, Omer Levi Hevroni
- :it: vientspam
- :jp: ninoseki
- :myanmar: thinbashane
- :netherlands: Bart Decker, Daan Sprenkels, Manu B, rachidbm,
  vientspam, Wout Huygens, Rick Daalhuizen
- :norway: owangen
- :poland: Idomin Ninja, Andrew Pio
- :portugal: Alvaro Viebrantz
- :romania: Mircea Ulmeanu, orjen, timexlord
- :ru: fieldhill13
- :es: alopezhu, CarlCampbell, Carlos Allendes, Ezequiel Andino,
  mateomartinez, soledad aro, Gorka Vicente
- :sweden: Anders Lindberg, atteism, cello-anders, Klas Fahlberg,
  landinl, Mattias Persson, Pär Swedberg
- :tr: Ender Çulha

### Special Thanks

* Inspired by the "classic"
  [BodgeIt Store](https://github.com/psiinon/bodgeit) by
  [@psiinon](https://github.com/psiinon)
* Revised OWASP Juice Shop and Juice Shop CTF logo artworks by Emily
  Gundry (courtesy of [@SecureState](https://github.com/SecureState))
* [Pwning OWASP Juice Shop](https://leanpub.com/juice-shop) cover
  artwork by [Patch Kroll](https://99designs.de/profiles/3099878)

## Licensing [![license](https://img.shields.io/github/license/bkimminich/juice-shop.svg)](LICENSE)

This program is free software: you can redistribute it and/or modify it
under the terms of the [MIT license](LICENSE). OWASP Juice Shop and any
contributions are Copyright © by Bjoern Kimminich 2014-2018.

![Juice Shop Logo](https://raw.githubusercontent.com/bkimminich/juice-shop/master/app/public/images/JuiceShop_Logo.png)
