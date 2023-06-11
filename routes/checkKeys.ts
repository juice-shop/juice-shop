import { Request, Response } from 'express'
import { HDNodeWallet } from 'ethers'
import challengeUtils = require('../lib/challengeUtils')
import * as utils from '../lib/utils'

const challenges = require('../data/datacache').challenges

module.exports = function checkKeys () {
  return (req: Request, res: Response) => {
    try {
      const mnemonic = 'purpose betray marriage blame crunch monitor spin slide donate sport lift clutch'
      const mnemonicWallet = HDNodeWallet.fromPhrase(mnemonic)
      const privateKey = mnemonicWallet.privateKey
      challengeUtils.solveIf(challenges.seedPhraseLeakChallenge, () => {
        return req.body.privateKey === privateKey
      })
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json(utils.get(error))
    }
  }
}
