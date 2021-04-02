const ExifImage = require('exif').ExifImage
let pathToImage = 'frontend/src/assets/public/images/products/'
const config = require('config')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const path = require('path')
chai.use(sinonChai)

const products = config.get('products')

describe('forBlueprintChallenge', () => {
  describe('exifDataValidation', () => {
    it('should contain the exif data for the blueprint challenge', () => {
      products.forEach(product => {
        if (product.exifForBlueprintChallenge !== undefined) {
          const url = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/
          if (url.test(product.image)) {
            pathToImage = product.image
          } else {
            pathToImage = pathToImage + product.image
          }
          ExifImage({ image: path.resolve(pathToImage) }, function (error, exifData) {
            if (error) {
              expect.fail('Could no read EXIF data')
            }
            Object.getOwnPropertyNames(product.exifForBlueprintChallenge).forEach(property => {
              expect(exifData.image[property]).to.equal(product.exifForBlueprintChallenge[property])
            })
          })
        }
      })
    })
  })
})
