/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, Directive, Injectable, Input } from '@angular/core'

export class GalleryRef {
    addImage (_data: any) {
        // no-op mock implementation, image data is not used in tests
    }

    load (_items: any[]) {
        // no-op mock implementation, item list is not used in tests
    }
}

@Injectable({ providedIn: 'root' })
export class Gallery {
    ref (_id?: string): GalleryRef {
        return new GalleryRef()
    }
}

@Component({ selector: 'gallery', template: '<ng-content></ng-content>', standalone: true })
export class GalleryComponent {
    @Input() autoplay: boolean
    @Input() thumbs: boolean
    @Input() counter: boolean
    @Input() imageSize: string
}

@Directive({ selector: '[galleryImageDef]', standalone: true })
export class GalleryImageDef {}
