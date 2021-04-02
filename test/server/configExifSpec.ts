const ExifImage = require('exif').ExifImage
let pathToImage = 'frontend/src/assets/public/images/products/3d_keychain.jpg'
const config = require('config')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const products = config.get('products')

describe('forBlueprintChallenge', () => {
  describe('exifDataValidation', () => {
    it('should contain the exif data for the blueprint challenge', () => {
      products.forEach(product => {
        if (product.exifForBlueprintChallenge !== undefined) {
          ExifImage({ image: pathToImage }, function (error, exifData) {
            if (error) {
              expect.fail("Could no read EXIF data")
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
