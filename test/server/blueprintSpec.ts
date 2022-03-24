import chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)
const config = require('config')
const fs = require('fs')
const path = require('path')
const ExifImage = require('exif').ExifImage
const utils = require('../../lib/utils')
const { pipeline } = require('stream')
const { promisify } = require('util')
const fetch = require('node-fetch')

describe('blueprint', () => {
  const products = config.get('products')
  let pathToImage: string = 'assets/public/images/products/'

  describe('checkExifData', () => {
    it('should contain properties from exifForBlueprintChallenge', async () => {
      for (const product of products) {
        if (product.fileForRetrieveBlueprintChallenge) {
          if (utils.isUrl(product.image)) {
            pathToImage = path.resolve('frontend/dist/frontend', pathToImage, product.image.substring(product.image.lastIndexOf('/') + 1))
            const streamPipeline = promisify(pipeline)
            const response = await fetch(product.image)
            if (!response.ok) expect.fail(`Could not download image from ${product.image}`)
            await streamPipeline(response.body, fs.createWriteStream(pathToImage))
          } else {
            pathToImage = path.resolve('frontend/src', pathToImage, product.image)
          }

          if (product.exifForBlueprintChallenge !== null) { // Prevents failing test for sample or custom themes where null has been explicitly set via "exifForBlueprintChallenge: ~". Warning: This makes the "Retrieve Blueprint" challenge probably unsolvable unless hints are placed elsewhere.
            ExifImage({ image: pathToImage }, function (error: Error, exifData: any) {
              if (error) {
                expect.fail(`Could not read EXIF data from ${pathToImage}`)
              }
              const properties = Object.values(exifData.image)
              product.exifForBlueprintChallenge.forEach((property: string) => {
                expect(properties).to.include(property)
              })
            })
          }
        }
      }
    }, 10000)
  })
})
