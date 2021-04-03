const ExifImage = require('exif').ExifImage
let pathToImage = 'frontend/src/assets/public/images/products/'
const config = require('config')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const path = require('path')
const download = require('download')
chai.use(sinonChai)

const products = config.get('products')

describe('forBlueprintChallenge', () => {
  describe('exifDataValidation', () => {
    it('should contain the exif data for the blueprint challenge', async () => {
      await products.forEach(async product => {
        if (product.exifForBlueprintChallenge !== undefined) {
          const url = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/
          if (url.test(product.image)) {
            const filepath = 'frontend/dist/frontend/assets/public/images/products'
            await download(product.image, filepath)
            const splitPath = product.image.split('/')
            pathToImage = path.resolve(filepath, splitPath[splitPath.length - 1])
          } else {
            pathToImage = path.resolve(pathToImage, product.image)
          }
          ExifImage({ image: pathToImage }, function (error, exifData) {
            if (error) {
              expect.fail('Could not read EXIF data')
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
