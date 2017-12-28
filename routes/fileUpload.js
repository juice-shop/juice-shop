const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const libxml = require('libxmljs')

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
    if (utils.endsWith(file.originalname.toLowerCase(), '.xml') && file.buffer) {
      const xmlDoc = libxml.parseXml(file.buffer.toString(), { noblanks: true, noent: true, nocdata: true })
      const xmlString = xmlDoc.toString()
      if (utils.notSolved(challenges.xxeFileDisclosureChallenge) && (matchesSystemIniFile(xmlString) || matchesEtcPasswdFile(xmlString))) {
        utils.solve(challenges.xxeFileDisclosureChallenge)
      }
      res.status(410)
      next(new Error('B2B customer complaints via file upload have been deprecated for security reasons!\n' + xmlString))
    } else {
      res.status(204).end()
    }
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
