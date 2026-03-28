/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { TokenSaleComponent } from './token-sale.component'
import { of, throwError } from 'rxjs'
import { ConfigurationService } from '../Services/configuration.service'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'

describe('TokenSaleComponent', () => {
    let component: TokenSaleComponent
    let fixture: ComponentFixture<TokenSaleComponent>
    let configurationService: any

    beforeEach(async () => {
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: {} }))
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                MatCardModule,
                MatButtonModule,
                TokenSaleComponent
            ],
            providers: [
                { provide: ConfigurationService, useValue: configurationService }
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(TokenSaleComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should set altcoinName as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { altcoinName: 'Coin' } }))
        component.ngOnInit()
        expect(component.altcoinName).toBe('Coin')
    })

    it('should log error on failure in retrieving configuration from backend', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })
})
