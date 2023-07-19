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
      const publicKey = mnemonicWallet.publicKey
      const address = mnemonicWallet.address
      challengeUtils.solveIf(challenges.nftUnlockChallenge, () => {
        return req.body.privateKey === privateKey
      })
      if (req.body.privateKey === privateKey) {
        res.status(200).json({ success: true, message: 'Challenge successfully solved', status: challenges.nftUnlockChallenge })
      } else {
        if (req.body.privateKey === address) {
          res.status(401).json({ success: false, message: 'Looks like you entered the public address of the ethereum wallet!', status: challenges.nftUnlockChallenge })
        } else if (req.body.privateKey === publicKey) {
          res.status(401).json({ success: false, message: 'Looks like you entered the public key of the ethereum wallet!', status: challenges.nftUnlockChallenge })
        } else if (req.body.privateKey === '1DZAxZJvgxbPYoqei7XMKH1tKxyLXtm8u2') {
          res.status(401).json({ success: false, message: 'Looks like you entered the public address of the BTC wallet!', status: challenges.nftUnlockChallenge })
        } else if (req.body.privateKey === '03f0288d967284f9f69ec4731c5eed33b7e2a990f34ef6818b76e663cd73943b57') {
          res.status(401).json({ success: false, message: 'Looks like you entered the public key of the BTC wallet!', status: challenges.nftUnlockChallenge })
        } else if (req.body.privateKey === 'Kxap9dhP5WeoRreFZqT3jvc4tBtGTrS2kbmBUUp37jPJD2XfTKhr') {
          res.status(401).json({ success: false, message: 'Looks like you entered the private key of the BTC wallet!', status: challenges.nftUnlockChallenge })
        } else {
          res.status(401).json({ success: false, message: 'Wrong Input, Please try again!', status: challenges.nftUnlockChallenge })
        }
      }
    } catch (error) {
      res.status(500).json(utils.get(error))
    }
  }
}
module.exports.nftUnlocked = function nftUnlocked () {
  return (req: Request, res: Response) => {
    try {
      res.status(200).json({ status: challenges.nftUnlockChallenge.solved })
    } catch (error) {
      res.status(500).json(utils.get(error))
    }
  }
}
