/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { ProductImageComponent } from './product-image.component'

describe('ProductImageComponent', () => {
    let component: ProductImageComponent
    let fixture: ComponentFixture<ProductImageComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductImageComponent]
        }).compileComponents()
        fixture = TestBed.createComponent(ProductImageComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should build one source per format from alternateImages with density descriptors', () => {
        fixture.componentRef.setInput('alternateImages', [
            { file: 'apple_juice-1x.avif', format: 'image/avif', density: '1x' },
            { file: 'apple_juice-2x.avif', format: 'image/avif', density: '2x' },
            { file: 'apple_juice-3x.avif', format: 'image/avif', density: '3x' }
        ])
        fixture.detectChanges()
        expect(component.imageSources()).toEqual([
            {
                format: 'image/avif',
                srcset: 'assets/public/images/products/apple_juice-1x.avif 1x, assets/public/images/products/apple_juice-2x.avif 2x, assets/public/images/products/apple_juice-3x.avif 3x'
            }
        ])
    })

    it('should build sources for multiple formats and prefer density over width', () => {
        fixture.componentRef.setInput('alternateImages', [
            { file: 'apple_juice.avif', format: 'image/avif', density: '2x' },
            { file: 'apple_juice.webp', format: 'image/webp', width: '450w' }
        ])
        fixture.detectChanges()
        expect(component.imageSources()).toEqual([
            { format: 'image/avif', srcset: 'assets/public/images/products/apple_juice.avif 2x' },
            { format: 'image/webp', srcset: 'assets/public/images/products/apple_juice.webp 450w' }
        ])
    })

    it('should return no sources when no alternateImages are present', () => {
        expect(component.imageSources()).toEqual([])
    })

    it('should render one source element per format and project the fallback image', () => {
        fixture.componentRef.setInput('alternateImages', [
            { file: 'apple_juice-1x.avif', format: 'image/avif', density: '1x' },
            { file: 'apple_juice-2x.avif', format: 'image/avif', density: '2x' }
        ])
        fixture.detectChanges()
        const compiled: HTMLElement = fixture.nativeElement
        const sources = compiled.querySelectorAll('picture source[type="image/avif"]')
        expect(sources.length).toBe(1)
        expect(sources[0].getAttribute('srcset')).toContain('apple_juice-1x.avif 1x')
        expect(sources[0].getAttribute('srcset')).toContain('apple_juice-2x.avif 2x')
    })
})
