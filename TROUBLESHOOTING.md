# Troubleshooting [![Gitter](http://img.shields.io/badge/gitter-join%20chat-1dce73.svg)](https://gitter.im/bkimminich/juice-shop)

## Node.js / NPM / Bower

- After changing to a different Node.js version it is a good idea to
  delete `npm_modules` and re-install all dependencies from scratch with
  `npm install`
- If you are experiencing
  [Error 128](https://github.com/bower/bower/issues/50) from some GitHub
  repos during `bower install` execution, run `git config --global
  url."https://".insteadOf git://` and try `npm install` again
- If during `npm install` the `sqlite3` no binaries can be downloaded
  for your system, the setup falls back to building from source with
  `node-gyp`. Check the
  [`node-gyp` installation instructions](https://github.com/nodejs/node-gyp#installation)
  for additional tools you might need to install (e.g. Python 2.7, GCC,
  Visual C++ Build Tools etc.)
- If `npm install` fails on Ubuntu (e.g. while installing PhantomJS) you
  might have to install a recent version of Node.js and try again.
- If `npm install` runs into a `Unexpected end of JSON input` error you might need to clean your NPM cache with `npm cache clean --force` and then try again

## Docker

- If using Docker Toolbox on Windows make sure that you also enable port
  forwarding from Host `127.0.0.1:3000` to `0.0.0.0:3000` for TCP for
  the `default` VM in VirtualBox.

## Vagrant

- Using the Vagrant script (on Windows) might not work while your virus
  scanner is running. This problem was experienced at least with
  F-Secure Internet Security.

## OAuth

- If you are missing the _Login with Google_ button, you are running
  OWASP Juice Shop under an unrecognized URL. **You can still solve the
  OAuth related challenge!** If you want to manually make the OAuth
  integration work to get the full user experience, follow these steps:
  1. Add your server URL to variable `authorizedRedirectURIs` in
     `/app/js/controllers/LoginController.js` using your URL for both
     the property name and value.
  2. Setup OAuth in Google
     https://console.developers.google.com/apis/library by clicking
     _Credentials_ and afterwards _Create credentials_.
  3. Update the `clientId` variable in
     `/app/js/controllers/LoginController.js` to use your new OAuth
     client id from Google.
  4. Re-deploy your server. You will now have the option to login with
     Google on the login page.

> One thing to note: Make sure that you setup the `redirect_uri` to
> match your app's URL. If you for some reason have to modify the
> `redirect_uri`, this gets cached on Google's end and takes longer than
> you'll want to wait to reset.

## Miscellaneous

- You may find it easier to find vulnerabilities using a pen test tool.
  I strongly recommend
  [Zed Attack Proxy](https://code.google.com/p/zaproxy/) which is open
  source and very powerful, yet beginner friendly.
