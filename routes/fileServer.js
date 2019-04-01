const path = require('path')
const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges

module.exports = function servePublicFiles () {
  return ({ params, query }, res, next) => {
    const file = params.file

    if (!file.includes('/')) {
      verify(file, res, next)
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }

  function verify (file, res, next) {
    if (file && (endsWithWhitelistedFileType(file) || (file === 'incident-support.kdbx'))) {
      file = insecurity.cutOffPoisonNullByte(file)
      verifySuccessfulPoisonNullByteExploit(file)
      res.sendFile(path.resolve(__dirname, '../ftp/', file))
    } else {
      res.status(403)
      next(new Error('Only .md and .pdf files are allowed!'))
    }
  }

  function verifySuccessfulPoisonNullByteExploit (file) {
    if (utils.notSolved(challenges.easterEggLevelOneChallenge) && file.toLowerCase() === 'eastere.gg') {
      utils.solve(challenges.easterEggLevelOneChallenge)
    } else if (utils.notSolved(challenges.directoryListingChallenge) && file.toLowerCase() === 'acquisitions.md') {
      utils.solve(challenges.directoryListingChallenge)
    } else if (utils.notSolved(challenges.forgottenDevBackupChallenge) && file.toLowerCase() === 'package.json.bak') {
      utils.solve(challenges.forgottenDevBackupChallenge)
    } else if (utils.notSolved(challenges.forgottenBackupChallenge) && file.toLowerCase() === 'coupons_2013.md.bak') {
      utils.solve(challenges.forgottenBackupChallenge)
    } else if (utils.notSolved(challenges.misplacedSignatureFileChallenge) && file.toLowerCase() === 'suspicious_errors.yml') {
      utils.solve(challenges.misplacedSignatureFileChallenge)
    }
  }

  function endsWithWhitelistedFileType (param) {
    return utils.endsWith(param, '.md') || utils.endsWith(param, '.pdf')
  }
}
