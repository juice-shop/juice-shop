# Juice Shop

An intentionally insecure webapp suitable for pentesting and security awareness trainings written in Node, Express and Angular. Inspired by the "classic" [BodgeIt Store](https://code.google.com/p/bodgeit/) by [@psiinon](https://github.com/psiinon).

> Juice Shop is the first application written entirely in Javascript listed in the [OWASP VWA Directory](https://www.owasp.org/index.php/OWASP_Vulnerable_Web_Applications_Directory_Project). It also seems to be the first broken webapp that uses the currently popular architecture of an SPA/RIA frontend with a RESTful backend.

[![Build Status](https://travis-ci.org/bkimminich/juice-shop.svg)](https://travis-ci.org/bkimminich/juice-shop)
[![Test Coverage](https://codeclimate.com/github/bkimminich/juice-shop/badges/coverage.svg)](https://codeclimate.com/github/bkimminich/juice-shop)
[![Code Climate](https://codeclimate.com/github/bkimminich/juice-shop/badges/gpa.svg)](https://codeclimate.com/github/bkimminich/juice-shop)
[![Dependency Status](https://gemnasium.com/bkimminich/juice-shop.svg)](https://gemnasium.com/bkimminich/juice-shop)
[![Dependency Status npm](https://www.versioneye.com/user/projects/544a2e5ac310f92c920000ec/badge.svg)](https://www.versioneye.com/user/projects/544a2e5ac310f92c920000ec)
[![Dependency Status bower](https://www.versioneye.com/user/projects/544a2e5ac310f965f90000eb/badge.svg)](https://www.versioneye.com/user/projects/544a2e5ac310f965f90000eb)
[![Dependency Status](https://david-dm.org/bkimminich/juice-shop.svg)](https://david-dm.org/bkimminich/juice-shop)
[![devDependency Status](https://david-dm.org/bkimminich/juice-shop/dev-status.svg)](https://david-dm.org/bkimminich/juice-shop#info=devDependencies)
[![Sauce Test Status](https://saucelabs.com/buildstatus/juice-shop)](https://saucelabs.com/u/juice-shop)

> Translating "dump" or "useless outfit" into German yields "Saftladen" which can be reverse-translated word by word into "juice shop". Hence the project name. That the initials "JS" match with those of "Javascript" was purely coincidental!
    
You may find it easier to find vulnerabilities using a pen test tool. I strongly recommend [Zed Attack Proxy](https://code.google.com/p/zaproxy/) which is open source and very powerful, yet beginner friendly.
 
## Features

- Easy to install: Just requires [node.js](http://nodejs.org)
- Self contained: Additional dependencies will be resolved and downloaded automatically
- No external DB:  A simple file based SQLite database is used which is wiped and regenerated on server startup
- Open source: No hidden costs or caveats
- Score Board: The application keeps track of known vulnerabilities the user has successfully exploited

## Preview

Feel free to have a look at the latest version of Juice Shop: <http://juice-shop.jit.su/>

> This is a "sneak-peek" instance only! You are __not allowed__ to use this instance for your own hacking endeavors! Technically [Nodejitsu](https://www.nodejitsu.com/) could view hacking activity on this instance as an attack on their infrastructure! You have been warned!

## Setup

> If you need help with the application setup please check the Troubleshooting section below or post your specific problem or question in the [official Gitter Chat](https://gitter.im/bkimminich/juice-shop).

### From Sources

1. Install [node.js](http://nodejs.org) (version 0.10.x)
2. Run ```git clone https://github.com/bkimminich/juice-shop.git``` (or clone [your own fork](https://github.com/bkimminich/juice-shop/fork) of the repository) 
3. Run ```npm install``` (only has to be done before first start or when you change the source code)
4. Run ```npm start```
5. Browse to <http://localhost:3000>

### Docker Container

1. Install [Docker](https://www.docker.com)
2. Run ```docker pull bkimminich/juice-shop```
3. Run ```docker run -d -p 3000:3000 bkimminich/juice-shop```
4. Browse to <http://localhost:3000> 

### Packaged Distribution

1. Install [node.js](http://nodejs.org) (version 0.10.x)
2. Download ```juice-shop-<version>.zip``` attached to [latest release](https://github.com/bkimminich/juice-shop/releases/latest)
3. Unpack and run ```npm start``` in unzipped folder
4. Browse to <http://localhost:3000>

### Amazon EC2 Instance

1. Setup an _Amazon Linux AMI_ instance
2. Copy the script below into _User Data_:
3. Use a _Security Group_ that opens port 80
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

> Technically Amazon could view hacking activity on any EC2 instance as an attack on their AWS infrastructure! I highly disrecommend aggressive scanning or automated brute force attacks! You have been warned!

## Troubleshooting

- If you are experiencing [Error 128](https://github.com/bower/bower/issues/50) from some GitHub repos during ```bower_install.js``` execution, run ```git config --global url."https://".insteadOf git://``` and try ```npm install``` again
- If using Boot2Docker (Docker inside VirtualBox on Windows) make sure that you also enable port forwarding from Host ```127.0.0.1:3000``` to ```0.0.0.0:3000``` for TCP 
- If ```npm install``` fails after an update of your local copy during ```bower_install.js``` complaining about version issues, delete ```/app/bower_components``` and try again to remove outdated versions that cause conflicts

## License
Copyright (c) 2015 Bjoern Kimminich  
Licensed under the MIT license.

[![Docker](http://img.shields.io/badge/docker-bkimminich%2Fjuice--shop-blue.svg)](https://registry.hub.docker.com/u/bkimminich/juice-shop/)
[![HuBoard](http://img.shields.io/badge/Hu-Board-blue.svg)](https://huboard.com/bkimminich/juice-shop)
[![Gitter](http://img.shields.io/badge/gitter-join%20chat-1dce73.svg)](https://gitter.im/bkimminich/juice-shop)

[![Gratipay](http://img.shields.io/gratipay/bkimminich.svg)](https://gratipay.com/bkimminich)
[![Bountysource](https://www.bountysource.com/badge/tracker?tracker_id=6283055)](https://www.bountysource.com/trackers/6283055-juice-shop?utm_source=6283055&utm_medium=shield&utm_campaign=TRACKER_BADGE)
[![geeklist](http://img.shields.io/badge/geeklist-%5E5-green.svg)](https://geekli.st/bkimminich/i-built-the-juice-shop-broken-full-js-stack-webapp-for-pentesting-and-security-trainings)
[![endorse](https://api.coderwall.com/bkimminich/endorsecount.png)](https://coderwall.com/bkimminich)
