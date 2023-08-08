import { Request, Response } from 'express'
import challengeUtils = require('../lib/challengeUtils')
import * as utils from '../lib/utils'

const challenges = require('../data/datacache').challenges

module.exports.nftMint = function nftMint () {
  return (req: Request, res: Response) => {
    try {
      challengeUtils.solveIf(challenges.nftMintChallenge, () => {
        return true
      })
      res.status(200).json({ success: true, message: 'Challenge successfully solved', status: challenges.nftMintChallenge })
    } catch (error) {
      res.status(500).json(utils.get(error))
    }
  }
}
