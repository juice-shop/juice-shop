import { type Request, type Response } from 'express'

import logger from '../lib/logger'
import * as challengeUtils from '../lib/challengeUtils'
import { nftABI } from '../data/static/contractABIs'
import { challenges } from '../data/datacache'
import * as utils from '../lib/utils'

const nftAddress = '0x41427790c94E7a592B17ad694eD9c06A02bb9C39'
const addressesMinted = new Set()
let isEventListenerCreated = false

export function nftMintListener () {
  return async (req: Request, res: Response) => {
    try {
      if (!isEventListenerCreated) {
        const { WebSocketProvider, Contract } = await import('ethers')
        const provider = new WebSocketProvider(`wss://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY ?? ''}`)
        provider.websocket.onerror = (error: any) => {
          logger.error(`WebSocket error (NFT Mint Listener): ${error.message || error}`)
          isEventListenerCreated = false
        }
        const contract = new Contract(nftAddress, nftABI, provider as any)
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
