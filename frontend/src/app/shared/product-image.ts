/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const IMAGE_BASE_PATH = 'assets/public/images/products/'

// File extension -> MIME type advertised in a <picture> <source> or CSS image-set().
const IMAGE_MIME_TYPES: Record<string, string> = {
  avif: 'image/avif',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png'
}

// Optimized formats offered (highest priority first) as alternatives to the original image.
// Variants for these must be generated on disk (see `npm run images:convert`). Add a format
// here to roll it out everywhere - the components and backdrops pick it up automatically.
export const OPTIMIZED_IMAGE_FORMATS = ['avif'] as const

export interface ImageSource {
  srcset: string
  type: string
}

/** Absolute asset path of a product image filename. */
export function productImagePath (image: string): string {
  return IMAGE_BASE_PATH + image
}

/**
 * Builds the optimized <picture> <source> descriptors for a product image by swapping its
 * extension for each configured format. Returns an empty list when the image has no
 * (replaceable) extension, in which case only the original <img> fallback should be rendered.
 */
export function productImageSources (image: string, formats: readonly string[] = OPTIMIZED_IMAGE_FORMATS): ImageSource[] {
  const match = /\.([a-z0-9]+)$/i.exec(image)
  if (!match) {
    return []
  }
  const extension = match[1].toLowerCase()
  return formats
    .filter((format) => format !== extension && IMAGE_MIME_TYPES[format] != null)
    .map((format) => ({
      srcset: productImagePath(image.replace(/\.[a-z0-9]+$/i, `.${format}`)),
      type: IMAGE_MIME_TYPES[format]
    }))
}

/**
 * Builds a CSS `background-image` value that prefers the optimized formats (via image-set())
 * and falls back to the original image.
 */
export function productImageBackground (image: string, formats: readonly string[] = OPTIMIZED_IMAGE_FORMATS): string {
  const fallback = `url('${productImagePath(image)}')`
  const sources = productImageSources(image, formats)
  if (sources.length === 0) {
    return fallback
  }
  const options = sources.map((source) => `url('${source.srcset}') type('${source.type}')`)
  return `image-set(${[...options, fallback].join(', ')})`
}
