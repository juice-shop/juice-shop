import { type Request, type Response } from 'express'
import { WebSocketProvider, Contract } from 'ethers'

import * as challengeUtils from '../lib/challengeUtils'
import { nftABI } from '../data/static/contractABIs'
import { challenges } from '../data/datacache'
import * as utils from '../lib/utils'
import logger from '../lib/logger'

const nftAddress = '0x41427790c94E7a592B17ad694eD9c06A02bb9C39'
const addressesMinted = new Set()
let provider: WebSocketProvider | null = null
let isEventListenerCreated = false

function getProvider (): WebSocketProvider | null {
  if (provider !== null) {
    return provider
  }
  try {
    provider = new WebSocketProvider(`wss://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY ?? ''}`)
    provider.websocket.on('error', (err: Error) => {
      logger.warn('WebSocket error for NFT Mint provider: ' + err.message)
      provider = null
      isEventListenerCreated = false
    })
    return provider
  } catch (err) {
    logger.warn('Failed to create NFT Mint provider: ' + utils.getErrorMessage(err))
    return null
  }
}

export function nftMintListener () {
  return async (req: Request, res: Response) => {
    try {
      const wsProvider = getProvider()
      if (wsProvider === null) {
        res.status(503).json({ success: false, message: 'Blockchain provider unavailable. Please try again later.' })
        return
      }
      const contract = new Contract(nftAddress, nftABI, wsProvider)
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
      res.status(500).json(utils.getErrorMessage(error))
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
