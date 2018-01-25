const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const libxml = require('libxmljs')
const vm = require('vm')

exports = module.exports = function fileUpload () {
  return (req, res, next) => {
    const file = req.file
    if (utils.notSolved(challenges.uploadSizeChallenge) && file.size > 100000) {
      utils.solve(challenges.uploadSizeChallenge)
    }
    if (utils.notSolved(challenges.uploadTypeChallenge) && !(utils.endsWith(file.originalname.toLowerCase(), '.pdf') ||
        utils.endsWith(file.originalname.toLowerCase(), '.xml'))) {
      utils.solve(challenges.uploadTypeChallenge)
    }
    if (utils.endsWith(file.originalname.toLowerCase(), '.xml')) {
      if (utils.notSolved(challenges.deprecatedInterfaceChallenge)) {
        utils.solve(challenges.deprecatedInterfaceChallenge)
      }
      if (file.buffer) {
        const data = file.buffer.toString()
        if (utils.contains(data, '/dev/random')) { // circuit breaker to prevent common DoS attack
          next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
        }
        try {
          const sandbox = { libxml, data }
          vm.createContext(sandbox)
          const xmlDoc = vm.runInContext('libxml.parseXml(data, { noblanks: true, noent: true, nocdata: true })', sandbox, { timeout: 2000 })
          const xmlString = xmlDoc.toString()
          if (utils.notSolved(challenges.xxeFileDisclosureChallenge) && (matchesSystemIniFile(xmlString) || matchesEtcPasswdFile(xmlString))) {
            utils.solve(challenges.xxeFileDisclosureChallenge)
          }
          res.status(410)
          next(new Error('B2B customer complaints via file upload have been deprecated for security reasons!\n' + xmlString))
        } catch (err) {
          if (utils.notSolved(challenges.rceOccupyChallenge) && err.message === 'Script execution timed out.') {
            utils.solve(challenges.rceOccupyChallenge)
          }
          res.status(410)
          next(new Error('B2B customer complaints via file upload have been deprecated for security reasons!\n' + err))
        }
      }
    }
    res.status(204).end()
  }

  function matchesSystemIniFile (text) {
    const match = text.match(/(; for 16-bit app support|drivers|mci|driver32|386enh|keyboard|boot|display)/gi)
    return match && match.length >= 2
  }

  function matchesEtcPasswdFile (text) {
    const match = text.match(/\w*:\w*:\d*:\d*:\w*:.*/gi)
    return match && match.length >= 2
  }
}
