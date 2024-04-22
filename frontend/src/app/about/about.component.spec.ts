/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { AboutComponent } from './about.component'
import { MatCardModule } from '@angular/material/card'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { of } from 'rxjs'
import { ConfigurationService } from '../Services/configuration.service'
import { GalleryModule } from 'ng-gallery'

describe('AboutComponent', () => {
  let component: AboutComponent
  let fixture: ComponentFixture<AboutComponent>
  let configurationService

  beforeEach(waitForAsync(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { } }))

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        HttpClientTestingModule,
        MatCardModule,
        GalleryModule,
        AboutComponent
      ],
      providers: [
        { provide: ConfigurationService, useValue: configurationService }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set Twitter link as obtained from configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { social: { twitterUrl: 'TWITTER' } } }))
    component.ngOnInit()

    expect(component.twitterUrl).toBe('TWITTER')
  })

  it('should set Facebook link as obtained from configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { social: { facebookUrl: 'FACEBOOK' } } }))
    component.ngOnInit()

    expect(component.facebookUrl).toBe('FACEBOOK')
  })

  it('should set Slack link as obtained from configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { social: { slackUrl: 'SLACK' } } }))
    component.ngOnInit()

    expect(component.slackUrl).toBe('SLACK')
  })

  it('should set Reddit link as obtained from configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { social: { redditUrl: 'REDDIT' } } }))
    component.ngOnInit()

    expect(component.redditUrl).toBe('REDDIT')
  })

  it('should set press kit link as obtained from configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { social: { pressKitUrl: 'PRESS_KIT' } } }))
    component.ngOnInit()

    expect(component.pressKitUrl).toBe('PRESS_KIT')
  })

  it('should set NFT link as obtained from configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { social: { nftUrl: 'NFT' } } }))
    component.ngOnInit()

    expect(component.nftUrl).toBe('NFT')
  })
})
