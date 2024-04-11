import { defineConfig } from 'cypress'
import * as security from './lib/insecurity'
import config from 'config'
import { type Memory, type Product } from './data/types'
import * as utils from './lib/utils'
import * as otplib from 'otplib'

export default defineConfig({
  projectId: '3hrkhu',
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'test/cypress/e2e/**.spec.ts',
    downloadsFolder: 'test/cypress/downloads',
    fixturesFolder: false,
    supportFile: 'test/cypress/support/e2e.ts',
    setupNodeEvents (on: any) {
      on('before:browser:launch', (browser: any = {}, launchOptions: any) => { // TODO Remove after upgrade to Cypress >=12.5.0 <or> Chrome 119 become available on GitHub Workflows, see https://github.com/cypress-io/cypress-documentation/issues/5479
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args = launchOptions.args.map((arg: any) => {
            if (arg === '--headless') {
              return '--headless=new'
            }

            return arg
          })
        }
        return launchOptions
      })

      on('task', {
        GenerateCoupon (discount: number) {
          return security.generateCoupon(discount)
        },
        GetBlueprint () {
          for (const product of config.get<Product[]>('products')) {
            if (product.fileForRetrieveBlueprintChallenge) {
              const blueprint = product.fileForRetrieveBlueprintChallenge
              return blueprint
            }
          }
        },
        GetChristmasProduct () {
          return config.get<Product[]>('products').filter(
            (product: Product) => product.useForChristmasSpecialChallenge
          )[0]
        },
        GetCouponIntent () {
          const trainingData = require(`data/chatbot/${utils.extractFilename(
            config.get('application.chatBot.trainingData')
          )}`)
          const couponIntent = trainingData.data.filter(
            (data: { intent: string }) => data.intent === 'queries.couponCode'
          )[0]
          return couponIntent
        },
        GetFromMemories (property: string) {
          for (const memory of config.get<Memory[]>('memories') as any) {
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
          return config.get<Product[]>('products').filter(
            (product: Product) => product.keywordsForPastebinDataLeakChallenge
          )[0]
        },
        GetTamperingProductId () {
          const products: Product[] = config.get('products')
          for (let i = 0; i < products.length; i++) {
            if (products[i].urlForProductTamperingChallenge) {
              return i + 1
            }
          }
        },
        GenerateAuthenticator (inputString: string) {
          return otplib.authenticator.generate(inputString)
        },
        toISO8601 () {
          const date = new Date()
          return utils.toISO8601(date)
        },
        disableOnContainerEnv () {
          return utils.disableOnContainerEnv()
        },
        disableOnWindowsEnv () {
          return utils.disableOnWindowsEnv()
        }
      })
    }
  }
})
