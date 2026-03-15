import { type Request, type Response } from 'express'
import { WebSocketProvider, Contract } from 'ethers'
import type { EventEmitter } from 'events'
import * as utils from '../lib/utils'
import { challenges } from '../data/datacache'
import * as challengeUtils from '../lib/challengeUtils'
import { web3WalletABI } from '../data/static/contractABIs'

const web3WalletAddress = '0x413744D59d31AFDC2889aeE602636177805Bd7b0'
const walletsConnected = new Set()
let isEventListenerCreated = false

// Singleton provider — created once, reset on error
let provider: WebSocketProvider | null = null

function getProvider (): WebSocketProvider {
  if (provider === null) {
    provider = new WebSocketProvider('wss://eth-sepolia.g.alchemy.com/v2/FZDapFZSs1l6yhHW4VnQqsi18qSd-3GJ')
    ;(provider.websocket as unknown as EventEmitter).on('error', (err: Error) => {
      console.error('[web3Wallet] WebSocket error:', err.message)
      void provider?.destroy()
      provider = null
      isEventListenerCreated = false
    })
  }
  return provider
}

export function contractExploitListener () {
  return async (req: Request, res: Response) => {
    const metamaskAddress = req.body.walletAddress
    walletsConnected.add(metamaskAddress)
    try {
      const activeProvider = getProvider()
      const contract = new Contract(web3WalletAddress, web3WalletABI, activeProvider)
      if (!isEventListenerCreated) {
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
      // 503 instead of 500 — the service is temporarily unavailable
      // due to an upstream rate-limit or connectivity issue, not an
      // internal application error.
      res.status(503).json({ error: 'Blockchain service temporarily unavailable. Please try again later.' })
      console.error('[web3Wallet] Provider unavailable:', utils.getErrorMessage(error))
    }
  }
}
