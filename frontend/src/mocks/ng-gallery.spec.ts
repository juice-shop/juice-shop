/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Gallery, GalleryRef } from './ng-gallery'

describe('ng-gallery mock', () => {
    describe('GalleryRef', () => {
        it('addImage should be a no-op that does not throw and returns undefined', () => {
            const ref = new GalleryRef()

            expect(() => ref.addImage({ src: 'image.jpg' })).not.toThrow()
            expect(ref.addImage({ src: 'image.jpg' })).toBeUndefined()
        })

        it('load should be a no-op that does not throw and returns undefined', () => {
            const ref = new GalleryRef()

            expect(() => ref.load([{ src: 'image.jpg' }])).not.toThrow()
            expect(ref.load([{ src: 'image.jpg' }])).toBeUndefined()
        })
    })

    describe('Gallery', () => {
        it('ref should return a new GalleryRef instance', () => {
            const gallery = new Gallery()

            const ref = gallery.ref('feedback-gallery')

            expect(ref).toBeInstanceOf(GalleryRef)
        })
    })
})
