export {}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string, params?: any[] | Record<string, any> }) => Promise<any>
      on: (event: string, listener: (...args: any[]) => void) => void
      removeListener: (event: string, listener: (...args: any[]) => void) => void
      [key: string]: any
    }
  }
}
