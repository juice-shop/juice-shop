/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, Directive, Injectable, Input } from '@angular/core'

export class GalleryRef {
    addImage (_data: any) {}
    load (_items: any[]) {}
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
