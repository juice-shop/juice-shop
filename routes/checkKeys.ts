import { Request, Response } from 'express'
import { HDNodeWallet } from 'ethers'
import challengeUtils = require('../lib/challengeUtils')
import * as utils from '../lib/utils'

const challenges = require('../data/datacache').challenges

module.exports.checkKeys = function checkKeys () {
  return (req: Request, res: Response) => {
    try {
      const mnemonic = 'purpose betray marriage blame crunch monitor spin slide donate sport lift clutch'
      const mnemonicWallet = HDNodeWallet.fromPhrase(mnemonic)
      const privateKey = mnemonicWallet.privateKey
      challengeUtils.solveIf(challenges.seedPhraseLeakChallenge, () => {
        return req.body.privateKey === privateKey
      })
      if (req.body.privateKey === privateKey) {
        res.status(200).json({ success: true, status: challenges.seedPhraseLeakChallenge })
      } else {
        res.status(401).json({ success: false, status: challenges.seedPhraseLeakChallenge })
      }
    } catch (error) {
      res.status(500).json(utils.get(error))
    }
  }
}
module.exports.seedPhraseSolved = function seedPhraseSolved () {
  return (req: Request, res: Response) => {
    try {
      res.status(200).json({ status: challenges.seedPhraseLeakChallenge.solved })
    } catch (error) {
      res.status(500).json(utils.get(error))
    }
  }
}
