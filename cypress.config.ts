import { defineConfig } from 'cypress'
import * as security from './lib/insecurity'
import config from 'config'
import type { Memory as MemoryConfig, Product as ProductConfig } from './lib/config.types'
import * as utils from './lib/utils'
import { generateSync } from 'otplib'

export default defineConfig({
  projectId: '3hrkhu',
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 2
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'test/cypress/e2e/**.spec.ts',
    downloadsFolder: 'test/cypress/downloads',
    fixturesFolder: false,
    supportFile: 'test/cypress/support/e2e.ts',
    setupNodeEvents (on: any) {
      on('task', {
        GenerateCoupon (discount: number) {
          return security.generateCoupon(discount)
        },
        GetBlueprint () {
          for (const product of config.get<ProductConfig[]>('products')) {
            if (product.fileForRetrieveBlueprintChallenge) {
              const blueprint = product.fileForRetrieveBlueprintChallenge
              return blueprint
            }
          }
        },
        GetChristmasProduct () {
          return config.get<ProductConfig[]>('products').filter(
            (product) => product.useForChristmasSpecialChallenge
          )[0]
        },
        GetFromMemories (property: string) {
          for (const memory of config.get<MemoryConfig[]>('memories') as any) {
            if (memory[property]) {
              return memory[property]
            }
          }
        },
        GetFromConfig (variable: string) {
          return config.get(variable)
        },
        GetOverwriteUrl () {
          return config.get('challenges.overwriteUrlForProductTamperingChallenge')
        },
        GetPastebinLeakProduct () {
          return config.get<ProductConfig[]>('products').filter(
            (product) => product.keywordsForPastebinDataLeakChallenge
          )[0]
        },
        GetTamperingProductId () {
          const products = config.get<ProductConfig[]>('products')
          for (let i = 0; i < products.length; i++) {
            if (products[i].urlForProductTamperingChallenge) {
              return i + 1
            }
          }
        },
        GenerateAuthenticator (inputString: string) {
          return generateSync({ secret: inputString })
        },
        toISO8601 () {
          const date = new Date()
          return utils.toISO8601(date)
        },
        isDocker () {
          return utils.isDocker()
        },
        isWindows () {
          return utils.isWindows()
        }
      })
    }
  }
})
