import { type Request, type Response } from 'express'
import { type WebSocketProvider, Contract } from 'ethers'

import * as utils from '../lib/utils'
import { challenges } from '../data/datacache'
import * as challengeUtils from '../lib/challengeUtils'
import { web3WalletABI } from '../data/static/contractABIs'
import { getAlchemyProvider } from '../lib/web3utils'

const web3WalletAddress = '0x413744D59d31AFDC2889aeE602636177805Bd7b0'
const walletsConnected = new Set()
let listenerProvider: WebSocketProvider | null = null

export function contractExploitListener () {
  return async (req: Request, res: Response) => {
    const metamaskAddress = req.body.walletAddress
    walletsConnected.add(metamaskAddress)
    try {
      const provider = getAlchemyProvider()
      if (provider === null) {
        res.status(503).json({ success: false, message: 'Blockchain provider unavailable. Please try again later.' })
        return
      }
      if (listenerProvider !== provider) {
        const contract = new Contract(web3WalletAddress, web3WalletABI, provider)
        void contract.on('ContractExploited', (exploiter: string) => {
          if (walletsConnected.has(exploiter)) {
            walletsConnected.delete(exploiter)
            challengeUtils.solveIf(challenges.web3WalletChallenge, () => true)
          }
        })
        listenerProvider = provider
      }
      res.status(200).json({ success: true, message: 'Event Listener Created' })
    } catch (error) {
      res.status(500).json(utils.getErrorMessage(error))
    }
  }
}
