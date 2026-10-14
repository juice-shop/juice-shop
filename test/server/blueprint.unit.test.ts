import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import config from 'config'
import type { Product as ProductConfig } from '@juice-shop/lib/config.schema'

import fs from 'node:fs'
import path from 'node:path'
import { ExifImage } from 'exif'
import { Readable } from 'node:stream'

import * as utils from '../../lib/utils'
import { finished } from 'node:stream/promises'

async function parseExifData (imagePath: string): Promise<any> {
  return await new Promise((resolve, reject) => {
    // eslint-disable-next-line no-new
    new ExifImage({ image: imagePath }, (error: Error | null, exifData: any) => {
      if (error != null) {
        assert.fail(`Could not read EXIF data from ${imagePath}`)
        reject(error)
      }
      resolve(exifData)
    })
  })
}

void describe('blueprint', () => {
  const products = config.get<ProductConfig[]>('products')
  let pathToImage: string = 'assets/public/images/products/'

  void describe('checkExifData', () => {
    void it('should contain properties from exifForBlueprintChallenge', async () => {
      for (const product of products) {
        if (product.fileForRetrieveBlueprintChallenge && product.image) {
          if (utils.isUrl(product.image)) {
            pathToImage = path.resolve('frontend/dist/frontend', pathToImage, product.image.substring(product.image.lastIndexOf('/') + 1))
            const response = await fetch(product.image)
            if (!response.ok || !response.body) {
              assert.fail(`Could not download image from ${product.image}`)
              return
            }
            const fileStream = fs.createWriteStream(pathToImage, { flags: 'w' })
            await finished(Readable.fromWeb(response.body as any).pipe(fileStream))
          } else {
            pathToImage = path.resolve('frontend/src', pathToImage, product.image)
          }

          if (product.exifForBlueprintChallenge?.[0]) {
            try {
              const exifData = await parseExifData(pathToImage)
              const properties = Object.values(exifData.image)
              for (const property of product.exifForBlueprintChallenge) {
                assert.ok(properties.includes(property))
              }
            } catch (error) {
              assert.fail(`Could not read EXIF data from ${pathToImage}`)
            }
          }
        }
      }
    })
  })
})
