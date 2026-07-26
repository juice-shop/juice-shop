/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// CLI script to (re)generate optimized variants for every product image referenced in the
// configuration, so the product views can serve them via a <picture> element with a JPG/PNG
// fallback for browsers that do not support the optimized format.
//
// Requires ffmpeg with the encoder for the chosen format available on the PATH.
//
// Examples:
//   npm run images:convert                     # create missing AVIF variants (default format)
//   npm run images:convert -- --format webp    # create WebP variants instead
//   npm run images:convert -- --force          # overwrite existing variants

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'

import config from 'config'
import colors from 'colors/safe'

import { type Product, productImages } from '../config.schema'

const productImageDir = path.resolve(__dirname, '../../frontend/src/assets/public/images/products')
const sourceExtension = /\.(?:png|jpe?g)$/i

// libsvtav1/libaom (AVIF) have no alpha support and require 4:2:0 chroma, so transparency is
// flattened onto white before encoding. Formats that support alpha (e.g. WebP) skip this.
const flattenFilter = 'color=white[bg];[0:v]format=rgba[fg];[bg][fg]scale2ref[bg][fg];[bg][fg]overlay=shortest=1,format=yuv420p'

interface FormatConfig {
  /** Output file extension (without leading dot). */
  extension: string
  /** ffmpeg encoder name, used both to encode and to probe availability. */
  encoder: string
  /** Encoder-specific quality arguments. */
  encoderArgs: string[]
  /** Whether transparency has to be flattened onto white before encoding. */
  flattenAlpha: boolean
}

// Registry of supported output formats. Add an entry to enable a new format end-to-end; the
// frontend offers it once it is listed in `OPTIMIZED_IMAGE_FORMATS` (frontend/.../shared/product-image.ts).
const FORMATS: Record<string, FormatConfig> = {
  avif: { extension: 'avif', encoder: 'libsvtav1', encoderArgs: ['-crf', '35'], flattenAlpha: true },
  webp: { extension: 'webp', encoder: 'libwebp', encoderArgs: ['-quality', '80'], flattenAlpha: false }
}

function ensureEncoder (format: FormatConfig): void {
  let encoders = ''
  try {
    encoders = execFileSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8', stdio: 'pipe' })
  } catch {
    console.error(colors.red('ffmpeg was not found on your PATH. Please install ffmpeg and try again.'))
    process.exit(1)
  }
  if (!new RegExp(`\\b${format.encoder}\\b`).test(encoders)) {
    console.error(colors.red(`Your ffmpeg build does not provide the "${format.encoder}" encoder required for .${format.extension} output.`))
    process.exit(1)
  }
}

type ConversionResult = 'created' | 'skipped' | 'missing'

function convert (image: string, format: FormatConfig, force: boolean): ConversionResult {
  if (!sourceExtension.test(image)) {
    return 'skipped'
  }

  const input = path.join(productImageDir, image)
  const output = input.replace(sourceExtension, `.${format.extension}`)

  if (!existsSync(input)) {
    console.warn(colors.yellow(`  source image not found, skipping: ${image}`))
    return 'missing'
  }
  if (existsSync(output) && !force) {
    return 'skipped'
  }

  execFileSync('ffmpeg', [
    '-y',
    '-i', input,
    ...(format.flattenAlpha ? ['-filter_complex', flattenFilter] : []),
    '-c:v', format.encoder,
    ...format.encoderArgs,
    output
  ], { stdio: 'pipe' })

  console.log(`  ${colors.green('created')} ${path.basename(output)}`)
  return 'created'
}

function main (): void {
  const { values } = parseArgs({
    options: {
      format: { type: 'string', default: 'avif' },
      force: { type: 'boolean', default: false }
    }
  })
  const formatName = (values.format ?? 'avif').toLowerCase()
  const force = values.force ?? false

  const format = FORMATS[formatName]
  if (!format) {
    console.error(colors.red(`Unsupported format "${formatName}". Supported formats: ${Object.keys(FORMATS).join(', ')}.`))
    process.exit(1)
  }

  ensureEncoder(format)

  const products = config.get<Product[]>('products')
  const images = [...new Set(products.flatMap((product) => productImages(product.image)))]

  console.log(`Converting ${images.length} product image(s) to ${format.extension.toUpperCase()} in ${productImageDir}${force ? ' (overwriting existing variants)' : ''}...`)

  let created = 0
  let skipped = 0
  for (const image of images) {
    if (convert(image, format, force) === 'created') {
      created++
    } else {
      skipped++
    }
  }

  console.log(`Done. ${colors.green(`${created} created`)}, ${skipped} skipped.`)
}

main()
