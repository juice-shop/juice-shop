/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideHttpClientTesting } from '@angular/common/http/testing'

import { MatCardModule } from '@angular/material/card'

import { of } from 'rxjs'
import { ConfigurationService } from '../Services/configuration.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

import { AboutComponent } from './about.component'

describe('AboutComponent', () => {
    let component: AboutComponent
    let fixture: ComponentFixture<AboutComponent>
    let configurationService
    let translateService

    beforeEach(async () => {
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: {} }))
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        translateService.onLangChange = new EventEmitter()
        translateService.onTranslationChange = new EventEmitter()
        translateService.onFallbackLangChange = new EventEmitter()
        translateService.onDefaultLangChange = new EventEmitter()

        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            imports: [MatCardModule,
                AboutComponent,
                TranslateModule.forRoot()],
            providers: [
                { provide: ConfigurationService, useValue: configurationService },
                { provide: TranslateService, useValue: translateService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(AboutComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should set Mastodon link as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { mastodonUrl: 'MASTODON' } } }))
        component.ngOnInit()

        expect(component.mastodonUrl).toBe('MASTODON')
    })

    it('should set BlueSky link as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { blueSkyUrl: 'BLUESKY' } } }))
        component.ngOnInit()

        expect(component.blueSkyUrl).toBe('BLUESKY')
    })

    it('should set Twitter link as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { twitterUrl: 'TWITTER' } } }))
        component.ngOnInit()

        expect(component.twitterUrl).toBe('TWITTER')
    })

    it('should set Facebook link as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { facebookUrl: 'FACEBOOK' } } }))
        component.ngOnInit()

        expect(component.facebookUrl).toBe('FACEBOOK')
    })

    it('should set Slack link as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { slackUrl: 'SLACK' } } }))
        component.ngOnInit()

        expect(component.slackUrl).toBe('SLACK')
    })

    it('should set Reddit link as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { redditUrl: 'REDDIT' } } }))
        component.ngOnInit()

        expect(component.redditUrl).toBe('REDDIT')
    })

    it('should set press kit link as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { pressKitUrl: 'PRESS_KIT' } } }))
        component.ngOnInit()

        expect(component.pressKitUrl).toBe('PRESS_KIT')
    })

    it('should set NFT link as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { nftUrl: 'NFT' } } }))
        component.ngOnInit()

        expect(component.nftUrl).toBe('NFT')
    })
})
