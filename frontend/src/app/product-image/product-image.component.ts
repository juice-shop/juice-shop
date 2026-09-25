/*!
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core'
import { type AlternateImage } from '../Models/product.model'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-product-image',
  template: `
    <picture>
      @for (source of imageSources(); track source.format) {
        <source [srcset]="source.srcset" [type]="source.format">
      }
      <ng-content></ng-content>
    </picture>
  `
})
export class ProductImageComponent {
  alternateImages = input<AlternateImage[] | undefined>()

  readonly imageSources = computed(() => {
    const alternateImages = this.alternateImages()
    if (!alternateImages) return []
    const formats = [...new Set(alternateImages.map((image) => image.format))]
    return formats.map((format) => ({
      format,
      srcset: alternateImages
        .filter((image) => image.format === format && (image.density ?? image.width))
        .map((image) => `assets/public/images/products/${image.file} ${image.density ?? image.width}`)
        .join(', ')
    }))
  })
}
