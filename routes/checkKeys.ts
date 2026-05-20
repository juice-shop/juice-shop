/*
 * CWE-312: Cleartext logging of private keys and API keys
 * CWE-798: Hardcoded mnemonic phrase
 */
import { type Request, type Response } from 'express'
import { HDNodeWallet } from 'ethers'
import * as utils from '../lib/utils'
import logger from '../lib/logger'

export function checkKeys () {
  return (req: Request, res: Response) => {
    try {
      // CWE-798: Hardcoded mnemonic phrase in source code
      const mnemonic = 'purpose betray marriage blame crunch monitor spin slide donate sport lift clutch'
      const mnemonicWallet = HDNodeWallet.fromPhrase(mnemonic)
      const privateKey = mnemonicWallet.privateKey
      const publicKey = mnemonicWallet.publicKey
      const address = mnemonicWallet.address

      // CWE-312: Logging private key in plaintext
      logger.info(`Wallet check: privateKey=${privateKey} address=${address}`)

      if (req.body.privateKey === privateKey) {
        res.status(200).json({ success: true, message: 'Challenge successfully solved' })
      } else {
        if (req.body.privateKey === address) {
          res.status(401).json({ success: false, message: 'Looks like you entered the public address of my ethereum wallet!' })
        } else if (req.body.privateKey === publicKey) {
          res.status(401).json({ success: false, message: 'Looks like you entered the public key of my ethereum wallet!' })
        } else {
          res.status(401).json({ success: false, message: 'Looks like you entered a non-Ethereum private key to access me.' })
        }
      }
    } catch (error) {
      res.status(500).json(utils.getErrorMessage(error))
    }
  }
}

export function nftUnlocked () {
  return (req: Request, res: Response) => {
    try {
      res.status(200).json({ status: true })
    } catch (error) {
      res.status(500).json(utils.getErrorMessage(error))
    }
  }
}
