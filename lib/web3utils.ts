import { WebSocketProvider } from 'ethers'

import logger from './logger'
import * as utils from './utils'

let provider: WebSocketProvider | null = null

export function getAlchemyProvider (): WebSocketProvider | null {
  if (provider !== null) {
    return provider
  }
  try {
    provider = new WebSocketProvider(`wss://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY ?? ''}`)
    provider.websocket.onerror = (err) => {
      logger.warn('Alchemy WebSocket error: ' + ((err as any).message || (err as any).error?.message || 'connection failed'))
      provider = null
    }
    return provider
  } catch (err) {
    logger.warn('Failed to create Alchemy WebSocket provider: ' + utils.getErrorMessage(err))
    return null
  }
}

export function destroyProvider (): void {
  if (provider !== null) {
    void provider.destroy().catch(() => {})
    provider = null
  }
}
