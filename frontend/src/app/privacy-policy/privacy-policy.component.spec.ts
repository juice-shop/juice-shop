/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { EventEmitter } from '@angular/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { ConfigurationService } from '../Services/configuration.service'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { throwError, of } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

import { PrivacyPolicyComponent } from './privacy-policy.component'

describe('PrivacyPolicyComponent', () => {
    let component: PrivacyPolicyComponent
    let fixture: ComponentFixture<PrivacyPolicyComponent>
    let configurationService: any
    let translateService

    beforeEach(async () => {
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({}))
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        translateService.onLangChange = new EventEmitter()
        translateService.onTranslationChange = new EventEmitter()
        translateService.onFallbackLangChange = new EventEmitter()
        translateService.onDefaultLangChange = new EventEmitter()

        TestBed.configureTestingModule({
            imports: [MatCardModule,
                MatDividerModule,
                PrivacyPolicyComponent,
                TranslateModule.forRoot()],
            providers: [
                { provide: ConfigurationService, useValue: configurationService },
                { provide: TranslateService, useValue: translateService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(PrivacyPolicyComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should compile', () => {
        expect(component).toBeTruthy()
    })

    it('should handle error when getting application configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

})
