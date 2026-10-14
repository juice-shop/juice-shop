/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideHttpClientTesting } from '@angular/common/http/testing'

import { MatCardModule } from '@angular/material/card'

import { of, throwError } from 'rxjs'
import { ConfigurationService } from '../Services/configuration.service'
import { FeedbackService } from '../Services/feedback.service'
import { Gallery } from 'ng-gallery'
import { DomSanitizer } from '@angular/platform-browser'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

import { AboutComponent } from './about.component'

describe('AboutComponent', () => {
    let component: AboutComponent
    let fixture: ComponentFixture<AboutComponent>
    let configurationService
    let translateService
    let feedbackService
    let gallery
    let galleryRef
    let sanitizer

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
        feedbackService = {
            find: vi.fn().mockName("FeedbackService.find")
        }
        feedbackService.find.mockReturnValue(of([]))
        galleryRef = {
            addImage: vi.fn().mockName("GalleryRef.addImage")
        }
        gallery = {
            ref: vi.fn().mockName("Gallery.ref").mockReturnValue(galleryRef)
        }
        sanitizer = {
            bypassSecurityTrustHtml: vi.fn().mockName("DomSanitizer.bypassSecurityTrustHtml").mockImplementation((value: string) => value)
        }

        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            imports: [MatCardModule,
                AboutComponent,
                TranslateModule.forRoot()],
            providers: [
                { provide: ConfigurationService, useValue: configurationService },
                { provide: TranslateService, useValue: translateService },
                { provide: FeedbackService, useValue: feedbackService },
                { provide: Gallery, useValue: gallery },
                { provide: DomSanitizer, useValue: sanitizer },
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

    it('should leave social links undefined when configuration has no social section', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: {} }))
        component.ngOnInit()

        expect(component.mastodonUrl).toBeUndefined()
        expect(component.blueSkyUrl).toBeUndefined()
        expect(component.twitterUrl).toBeUndefined()
        expect(component.facebookUrl).toBeUndefined()
        expect(component.slackUrl).toBeUndefined()
        expect(component.redditUrl).toBeUndefined()
        expect(component.pressKitUrl).toBeUndefined()
        expect(component.nftUrl).toBeUndefined()
    })

    it('should log error and not throw if configuration retrieval fails', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
        configurationService.getApplicationConfiguration.mockReturnValue(throwError(() => new Error('config failure')))

        expect(() => component.ngOnInit()).not.toThrow()
        expect(errorSpy).toHaveBeenCalled()
        errorSpy.mockRestore()
    })

    it('should request a gallery reference for the feedback gallery on init', () => {
        expect(gallery.ref).toHaveBeenCalledWith('feedback-gallery')
        expect(component.galleryRef).toBe(galleryRef)
    })

    it('should add an image to the gallery for each feedback with formatted comment and stars', () => {
        feedbackService.find.mockReturnValue(of([{ comment: 'Great!', rating: 3 }]))

        component.populateSlideshowFromFeedbacks()

        expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(1)
        const sanitizedHtml = sanitizer.bypassSecurityTrustHtml.mock.calls[0][0]
        expect(sanitizedHtml).toContain('<p class="feedback-comment">Great!</p>')
        expect(sanitizedHtml).toContain('feedback-stars')
        expect((sanitizedHtml.match(/fas fa-star/g) ?? []).length).toBe(3)
        expect((sanitizedHtml.match(/far fa-star/g) ?? []).length).toBe(2)
        expect(galleryRef.addImage).toHaveBeenCalledTimes(1)
        expect(galleryRef.addImage.mock.calls[0][0].src).toBe('assets/public/images/carousel/1.jpg')
    })

    it('should cycle through the available carousel images when there are more feedbacks than images', () => {
        const feedbacks = Array.from({ length: 9 }, () => ({ comment: 'x', rating: 1 }))
        feedbackService.find.mockReturnValue(of(feedbacks))

        component.populateSlideshowFromFeedbacks()

        expect(galleryRef.addImage).toHaveBeenCalledTimes(9)
        const firstSrc = galleryRef.addImage.mock.calls[0][0].src
        const eighthSrc = galleryRef.addImage.mock.calls[7][0].src
        expect(eighthSrc).toBe(firstSrc)
    })

    it('should log error and not throw if loading feedbacks fails', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
        feedbackService.find.mockReturnValue(throwError(() => new Error('feedback failure')))

        expect(() => component.populateSlideshowFromFeedbacks()).not.toThrow()
        expect(errorSpy).toHaveBeenCalled()
        expect(galleryRef.addImage).not.toHaveBeenCalled()
        errorSpy.mockRestore()
    })

    describe('template rendering', () => {
        const renderWithSocial = (social: Record<string, string> = {}) => {
            configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social } }))
            const f = TestBed.createComponent(AboutComponent)
            f.detectChanges()
            return f
        }

        it('should render the corporate history section with terms of use link', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('section[aria-labelledby="corporate-history"]')).toBeTruthy()
            const termsLink = compiled.querySelector('a[href="ftp/legal.md"]') as HTMLAnchorElement
            expect(termsLink).toBeTruthy()
            expect(termsLink.getAttribute('aria-label')).toBe('Link to the Terms of Use')
        })

        it('should render the feedback gallery container with expected configuration', () => {
            const compiled: HTMLElement = fixture.nativeElement
            const gallery = compiled.querySelector('gallery#feedback-gallery')
            expect(gallery).toBeTruthy()
            expect(gallery?.classList.contains('gallery')).toBe(true)
            expect(compiled.querySelector('section[aria-labelledby="customer-feedback"]')).toBeTruthy()
        })

        it('should not render the social navigation when no social URLs are configured', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('nav.social-nav')).toBeNull()
            expect(compiled.querySelector('ul.social')).toBeNull()
        })

        it('should render social navigation only with links for the configured social URLs', () => {
            const f = renderWithSocial({ twitterUrl: 'https://twitter.example', slackUrl: 'https://slack.example' })
            const compiled: HTMLElement = f.nativeElement

            const nav = compiled.querySelector('nav.social-nav')
            expect(nav).toBeTruthy()
            const items = compiled.querySelectorAll('ul.social > li')
            expect(items.length).toBe(2)

            const hrefs = Array.from(compiled.querySelectorAll('ul.social a')).map(a => a.getAttribute('href'))
            expect(hrefs).toContain('https://twitter.example')
            expect(hrefs).toContain('https://slack.example')
            expect(hrefs).not.toContain(null)
        })

        it('should render a link for every social URL when all are configured', () => {
            const f = renderWithSocial({
                blueSkyUrl: 'B', mastodonUrl: 'M', twitterUrl: 'T', facebookUrl: 'F',
                slackUrl: 'S', redditUrl: 'R', pressKitUrl: 'P', nftUrl: 'N'
            })
            const compiled: HTMLElement = f.nativeElement
            expect(compiled.querySelectorAll('ul.social > li').length).toBe(8)
            for (const url of ['B', 'M', 'T', 'F', 'S', 'R', 'P', 'N']) {
                expect(compiled.querySelector(`ul.social a[href="${url}"]`)).toBeTruthy()
            }
        })

        it('should mark every social link to open in a new tab with safe rel attribute', () => {
            const f = renderWithSocial({ twitterUrl: 'https://twitter.example' })
            const link = f.nativeElement.querySelector('ul.social a') as HTMLAnchorElement
            expect(link.getAttribute('target')).toBe('_blank')
            expect(link.getAttribute('rel')).toBe('noopener noreferrer')
            expect(link.getAttribute('aria-label')).toBe('Visit our Twitter page')
        })
    })
})
