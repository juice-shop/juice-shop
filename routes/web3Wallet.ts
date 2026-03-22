import { type Request, type Response } from 'express'
import { WebSocketProvider, Contract } from 'ethers'

import logger from '../lib/logger'
import * as utils from '../lib/utils'
import { challenges } from '../data/datacache'
import * as challengeUtils from '../lib/challengeUtils'
import { web3WalletABI } from '../data/static/contractABIs'

const web3WalletAddress = '0x413744D59d31AFDC2889aeE602636177805Bd7b0'
const walletsConnected = new Set()
let isEventListenerCreated = false

export function contractExploitListener () {
  return async (req: Request, res: Response) => {
    const metamaskAddress = req.body.walletAddress
    walletsConnected.add(metamaskAddress)
    try {
      if (!isEventListenerCreated) {
        const provider = new WebSocketProvider(`wss://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY ?? ''}`)
        provider.websocket.on('error', (error: any) => {
          logger.error(`WebSocket error (Contract Exploit Listener): ${error.message || error}`)
          isEventListenerCreated = false
        })
        const contract = new Contract(web3WalletAddress, web3WalletABI, provider)
        void contract.on('ContractExploited', (exploiter: string) => {
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
