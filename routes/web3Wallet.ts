import { Request, Response } from 'express'
import challengeUtils = require('../lib/challengeUtils')
import * as utils from '../lib/utils'
const web3WalletABI = require('../data/static/contractABIs').web3WalletABI
const ethers = require('ethers')
const customHttpProvider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/0b88ff4d03a647b8a4649e9bfdf6644f')
const challenges = require('../data/datacache').challenges
const web3WalletAddress = '0x413744D59d31AFDC2889aeE602636177805Bd7b0'
const contract = new ethers.Contract(web3WalletAddress, web3WalletABI, customHttpProvider)
const walletsConnected = new Set()
let isEventListenerCreated = false

module.exports.contractExploitListener = function contractExploitListener () {
  return (req: Request, res: Response) => {
    const metamaskAddress = req.body.walletAddress
    console.log(metamaskAddress)
    walletsConnected.add(metamaskAddress)
    try {
      if (!isEventListenerCreated) {
        contract.on('ContractExploited', (exploiter: string) => {
          if (walletsConnected.has(exploiter)) {
            walletsConnected.delete(exploiter)
            console.log(exploiter, 'exploited')
            challengeUtils.solveIf(challenges.web3WalletChallenge, () => true)
          }
        })
        isEventListenerCreated = true
      }
      setInterval(async () => {
        try {
          await customHttpProvider.getLogs({
            address: web3WalletAddress,
            topics: contract.filters.ContractExploited().topics
          })
        } catch (err) {
          if (err.code === ethers.utils.Logger.errors.FILTER_NOT_FOUND) {
            console.log('Filter expired, recreating...')
            contract.removeAllListeners('ContractExploited')
            contract.on('ContractExploited', async (exploiter: string) => {
              if (walletsConnected.has(exploiter)) {
                walletsConnected.delete(exploiter)
                console.log(exploiter, 'exploited')
                challengeUtils.solveIf(challenges.web3WalletChallenge, () => true)
              }
            })
          }
        }
      }, 60000)
      res.status(200).json({ success: true, message: 'Event Listener Created' })
    } catch (error) {
      console.log(error)
      res.status(500).json(utils.get(error))
    }
  }
}
