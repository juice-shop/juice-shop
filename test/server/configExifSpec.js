const ExifImage = require('exif').ExifImage
const pathToImage = 'frontend/src/assets/public/images/products/3d_keychain.jpg'
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
        if (product.image === '3d_keychain.jpg') {
          ExifImage({ image: pathToImage }, function (error, exifData) {
            if (error) {
              expect(1).to.equal(0)
            }
            expect(product.exifForBlueprintChallenge).to.equal(exifData.image.Make)
          })
        }
      })
    })
  })
})
