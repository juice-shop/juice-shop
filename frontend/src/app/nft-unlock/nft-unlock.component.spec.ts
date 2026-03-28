/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatDividerModule } from '@angular/material/divider'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { of, throwError } from 'rxjs'

import { NFTUnlockComponent } from './nft-unlock.component'
import { KeysService } from '../Services/keys.service'

describe('NFTUnlockComponent', () => {
    let component: NFTUnlockComponent
    let fixture: ComponentFixture<NFTUnlockComponent>
    let keysServiceSpy: any

    beforeEach(async () => {
        keysServiceSpy = {
            nftUnlocked: vi.fn().mockName("KeysService.nftUnlocked"),
            submitKey: vi.fn().mockName("KeysService.submitKey")
        }
        keysServiceSpy.nftUnlocked.mockReturnValue(of({ status: false }))

        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                MatCardModule,
                MatButtonModule,
                MatInputModule,
                MatFormFieldModule,
                MatDividerModule,
                FormsModule,
                NFTUnlockComponent
            ],
            providers: [
                { provide: KeysService, useValue: keysServiceSpy }
            ]
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(NFTUnlockComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should check NFT unlock status on init', () => {
        keysServiceSpy.nftUnlocked.mockReturnValue(of({ status: true }))
        component.ngOnInit()
        expect(keysServiceSpy.nftUnlocked).toHaveBeenCalled()
        expect(component.successResponse).toBe(true)
    })

    it('should handle error when checking NFT status on init', () => {
        vi.spyOn(console, 'error')
        keysServiceSpy.nftUnlocked.mockReturnValue(throwError(() => new Error('Network error')))
        component.ngOnInit()
        expect(component.successResponse).toBe(false)
    })

    it('should handle successful key submission', () => {
        keysServiceSpy.submitKey.mockReturnValue(of({ success: true, message: 'Success!' }))
        component.privateKey = 'test-private-key'
        component.submitForm()
        expect(component.formSubmitted).toBe(true)
        expect(component.successResponse).toBe(true)
        expect(component.errorMessage).toBe('Success!')
    })

    it('should handle failed key submission with error response', () => {
        keysServiceSpy.submitKey.mockReturnValue(of({ success: false }))
        component.privateKey = 'test-private-key'
        component.submitForm()
        expect(component.successResponse).toBe(false)
    })

    it('should handle HTTP error on key submission', () => {
        keysServiceSpy.submitKey.mockReturnValue(throwError(() => ({ error: { message: 'Invalid key' } })))
        component.privateKey = 'test-private-key'
        component.submitForm()
        expect(component.successResponse).toBe(false)
        expect(component.errorMessage).toBe('Invalid key')
    })
})
