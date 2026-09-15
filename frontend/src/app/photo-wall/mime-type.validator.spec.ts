/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { FormControl } from '@angular/forms'
import { mimeType } from './mime-type.validator'
import { firstValueFrom, isObservable } from 'rxjs'

describe('mimeType validator', () => {
    it('should return null if control value is a string', async () => {
        const control = new FormControl('not a file')
        const result = mimeType(control)
        if (isObservable(result)) {
            expect(await firstValueFrom(result)).toBeNull()
        } else {
            expect(await result).toBeNull()
        }
    })

    it('should return null for valid PNG file', async () => {
        const blob = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' })
        const file = new File([blob], 'test.png', { type: 'image/png' })
        const control = new FormControl(file)
        const result = mimeType(control)
        if (isObservable(result)) {
            expect(await firstValueFrom(result)).toBeNull()
        } else {
            expect(await result).toBeNull()
        }
    })

    it('should return null for valid JPEG file', async () => {
        const blob = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], { type: 'image/jpeg' })
        const file = new File([blob], 'test.jpg', { type: 'image/jpeg' })
        const control = new FormControl(file)
        const result = mimeType(control)
        if (isObservable(result)) {
            expect(await firstValueFrom(result)).toBeNull()
        } else {
            expect(await result).toBeNull()
        }
    })

    it('should return invalidMimeType for invalid file header', async () => {
        const blob = new Blob([new Uint8Array([0x00, 0x00, 0x00, 0x00])], { type: 'image/png' })
        const file = new File([blob], 'test.png', { type: 'image/png' })
        const control = new FormControl(file)
        const result = mimeType(control)
        if (isObservable(result)) {
            expect(await firstValueFrom(result)).toEqual({ invalidMimeType: true })
        } else {
            expect(await result).toEqual({ invalidMimeType: true })
        }
    })
})
