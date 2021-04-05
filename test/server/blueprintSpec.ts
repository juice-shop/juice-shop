import chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)
const config = require('config')
const fs = require('fs')
const path = require('path')
const download = require('download')
const ExifImage = require('exif').ExifImage
const utils = require('../../lib/utils')

describe('blueprint', () => {
  const products = config.get('products')
  let pathToImage: string = 'assets/public/images/products/'

  describe('checkExifData', () => {
    it('should contain properties from exifForBlueprintChallenge', async () => {
      await products.forEach(async product => {
        if (product.fileForRetrieveBlueprintChallenge) {
          if (utils.startsWith(product.image, 'http')) {
            pathToImage = path.resolve('frontend/dist/frontend', pathToImage, product.image.substring(product.image.lastIndexOf('/') + 1))
            fs.writeFileSync(pathToImage, await download(product.image))
          } else {
            pathToImage = path.resolve('frontend/src', pathToImage, product.image)
          }

          ExifImage({ image: pathToImage }, function (error, exifData) {
            if (error) {
              expect.fail(`Could not read EXIF data from ${pathToImage}`)
            }
            const properties = Object.values(exifData.image)
            product.exifForBlueprintChallenge.forEach(property => {
              expect(properties).to.include(property)
            })
          })
        }
      })
    })
  })
})
