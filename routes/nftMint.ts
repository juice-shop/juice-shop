import { type Request, type Response } from 'express'
import { WebSocketProvider, Contract } from 'ethers'

import * as challengeUtils from '../lib/challengeUtils'
import { nftABI } from '../data/static/contractABIs'
import { challenges } from '../data/datacache'
import * as utils from '../lib/utils'

const nftAddress = '0x41427790c94E7a592B17ad694eD9c06A02bb9C39'
const addressesMinted = new Set()
let isEventListenerCreated = false

// Singleton provider — created once, reset on error
let provider: WebSocketProvider | null = null

function getProvider (): WebSocketProvider {
  if (provider === null) {
    provider = new WebSocketProvider('wss://eth-sepolia.g.alchemy.com/v2/FZDapFZSs1l6yhHW4VnQqsi18qSd-3GJ')
    ;(provider.websocket as unknown as import('events').EventEmitter).on('error', (err: Error) => {
      console.error('[nftMint] WebSocket error:', err.message)
      void provider?.destroy()
      provider = null
      isEventListenerCreated = false
    })
  }
  return provider
}

export function nftMintListener () {
  return async (req: Request, res: Response) => {
    try {
      const activeProvider = getProvider()
      const contract = new Contract(nftAddress, nftABI, activeProvider)
      if (!isEventListenerCreated) {
        void contract.on('NFTMinted', (minter: string) => {
          if (!addressesMinted.has(minter)) {
            addressesMinted.add(minter)
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
      console.error('[nftMint] Provider unavailable:', utils.getErrorMessage(error))
    }
  }
}

export function walletNFTVerify () {
  return (req: Request, res: Response) => {
    try {
      const metamaskAddress = req.body.walletAddress
      if (addressesMinted.has(metamaskAddress)) {
        addressesMinted.delete(metamaskAddress)
        challengeUtils.solveIf(challenges.nftMintChallenge, () => true)
        res.status(200).json({ success: true, message: 'Challenge successfully solved', status: challenges.nftMintChallenge })
      } else {
        res.status(200).json({ success: false, message: 'Wallet did not mint the NFT', status: challenges.nftMintChallenge })
      }
    } catch (error) {
      res.status(500).json(utils.getErrorMessage(error))
    }
  }
}