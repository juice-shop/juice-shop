import { type Request, type Response } from 'express'
import challengeUtils = require('../lib/challengeUtils')
import * as utils from '../lib/utils'
const web3WalletABI = require('../data/static/contractABIs').web3WalletABI
const ethers = require('ethers')
const challenges = require('../data/datacache').challenges
const web3WalletAddress = '0x413744D59d31AFDC2889aeE602636177805Bd7b0'
const walletsConnected = new Set()
let isEventListenerCreated = false

module.exports.contractExploitListener = function contractExploitListener () {
  return (req: Request, res: Response) => {
    const metamaskAddress = req.body.walletAddress
    walletsConnected.add(metamaskAddress)
    try {
      const provider = new ethers.WebSocketProvider('wss://eth-sepolia.g.alchemy.com/v2/FZDapFZSs1l6yhHW4VnQqsi18qSd-3GJ')
      const contract = new ethers.Contract(web3WalletAddress, web3WalletABI, provider)
      if (!isEventListenerCreated) {
        contract.on('ContractExploited', (exploiter: string) => {
          if (walletsConnected.has(exploiter)) {
            walletsConnected.delete(exploiter)
            challengeUtils.solveIf(challenges.web3WalletChallenge, () => true)
          }
        })
        isEventListenerCreated = true
      }
      res.status(200).json({ success: true, message: 'Event Listener Created' })
    } catch (error) {
      res.status(500).json(utils.getErrorMessage(error))
    }
  }
}
