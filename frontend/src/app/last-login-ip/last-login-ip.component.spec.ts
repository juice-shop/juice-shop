/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { EventEmitter } from '@angular/core'
import { of } from 'rxjs'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { LastLoginIpComponent } from './last-login-ip.component'
import { MatCardModule } from '@angular/material/card'
import { DomSanitizer } from '@angular/platform-browser'

describe('LastLoginIpComponent', () => {
    let component: LastLoginIpComponent
    let fixture: ComponentFixture<LastLoginIpComponent>
    let sanitizer
    let translateService

    beforeEach(async () => {
        sanitizer = {
            bypassSecurityTrustHtml: vi.fn().mockName("DomSanitizer.bypassSecurityTrustHtml"),
            sanitize: vi.fn().mockName("DomSanitizer.sanitize")
        }
        sanitizer.bypassSecurityTrustHtml.mockImplementation((args: any) => args)
        sanitizer.sanitize.mockReturnValue({})
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        translateService.onLangChange = new EventEmitter()
        translateService.onTranslationChange = new EventEmitter()
        translateService.onFallbackLangChange = new EventEmitter()
        translateService.onDefaultLangChange = new EventEmitter()

        TestBed.configureTestingModule({
            providers: [
                { provide: DomSanitizer, useValue: sanitizer },
                { provide: TranslateService, useValue: translateService }
            ],
            imports: [
                MatCardModule,
                LastLoginIpComponent,
                TranslateModule.forRoot()
            ]
        }).compileComponents()
    })

    beforeEach(() => {
        localStorage.clear()
        fixture = TestBed.createComponent(LastLoginIpComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    afterEach(() => {
        localStorage.clear()
    })

    it('should compile', () => {
        expect(component).toBeTruthy()
    })

    it('should log JWT parsing error to console', () => {
        console.log = vi.fn()
        localStorage.setItem('token', 'definitelyInvalidJWT')
        component.ngOnInit()
        expect(console.log).toHaveBeenCalled()
    })

    it('should set Last-Login IP from JWT as trusted HTML', () => {
        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Imxhc3RMb2dpbklwIjoiMS4yLjMuNCJ9fQ.RAkmdqwNypuOxv3SDjPO4xMKvd1CddKvDFYDBfUt3bg')
        component.ngOnInit()
        expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<small>1.2.3.4</small>')
    })

    it('should not set Last-Login IP if none is present in JWT', () => {
        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7fX0.bVBhvll6IaeR3aUdoOeyR8YZe2S2DfhGAxTGfd9enLw')
        component.ngOnInit()
        expect(sanitizer.bypassSecurityTrustHtml).not.toHaveBeenCalled()
    })
})
