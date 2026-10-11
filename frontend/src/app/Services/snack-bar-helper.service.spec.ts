/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { TranslateNoOpLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatSnackBarModule } from '@angular/material/snack-bar'

import { SnackBarHelperService } from './snack-bar-helper.service'

describe('SnackBarHelperService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useClass: TranslateNoOpLoader
                }
            }),
            MatSnackBarModule
        ],
        providers: [TranslateService]
    }))

    it('should be created', () => {
        const service: SnackBarHelperService = TestBed.inject(SnackBarHelperService)
        expect(service).toBeTruthy()
    })

    it('should translate the per-user limit message with the quantity for limit violations', () => {
        const service: SnackBarHelperService = TestBed.inject(SnackBarHelperService)
        const translateService = TestBed.inject(TranslateService)
        const getSpy = vi.spyOn(translateService, 'get')

        service.openBasketQuantityViolation({ type: 'limit', limitPerUser: 3 })

        expect(getSpy).toHaveBeenCalledWith('BASKET_ADD_PRODUCT_LIMIT', { quantity: 3 })
    })

    it('should show the out-of-stock message for stock violations', () => {
        const service: SnackBarHelperService = TestBed.inject(SnackBarHelperService)
        const openSpy = vi.spyOn(service, 'open')

        service.openBasketQuantityViolation({ type: 'stock' })

        expect(openSpy).toHaveBeenCalledWith('BASKET_ADD_PRODUCT_OUT_OF_STOCK', 'errorBar')
    })
})
