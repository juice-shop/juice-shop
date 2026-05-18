/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { TranslateModule } from '@ngx-translate/core'
import { QrCodeComponent } from './qr-code.component'
import { MatButtonModule } from '@angular/material/button'
import { QrCodeComponent as NgQrCodeComponent } from 'ng-qrcode'

// jsdom doesn't support canvas; stub getContext to prevent unhandled errors from ng-qrcode
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function (type: string, ...args: any[]) {
    if (type === '2d') {
        return {
            clearRect: vi.fn(),
            fillRect: vi.fn(),
            getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(0) }),
            putImageData: vi.fn(),
            createImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(0) }),
            setTransform: vi.fn(),
            drawImage: vi.fn(),
            save: vi.fn(),
            fillText: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            stroke: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            rotate: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            measureText: vi.fn().mockReturnValue({ width: 0 }),
            transform: vi.fn(),
            rect: vi.fn(),
            clip: vi.fn(),
            canvas: this
        } as any
    }
    return originalGetContext.call(this, type, ...args)
} as any

describe('QrCodeComponent', () => {
    let component: QrCodeComponent
    let fixture: ComponentFixture<QrCodeComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                NgQrCodeComponent,
                MatDividerModule,
                MatButtonModule,
                MatDialogModule,
                QrCodeComponent
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { data: 'data', url: 'url', address: 'address', title: 'title' } }
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(QrCodeComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
        component.ngOnInit()
        expect(component.title).toBe('title')
        expect(component.url).toBe('url')
        expect(component.address).toBe('address')
        expect(component.data).toBe('data')
    })
})
