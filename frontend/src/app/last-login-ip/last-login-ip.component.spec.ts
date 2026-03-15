/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { EventEmitter } from '@angular/core'
import { of } from 'rxjs'
import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { LastLoginIpComponent } from './last-login-ip.component'
import { MatCardModule } from '@angular/material/card'
import { DomSanitizer } from '@angular/platform-browser'

describe('LastLoginIpComponent', () => {
  let component: LastLoginIpComponent
  let fixture: ComponentFixture<LastLoginIpComponent>
  let sanitizer
  let translateService

  beforeEach(waitForAsync(() => {
    sanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml', 'sanitize'])
    sanitizer.bypassSecurityTrustHtml.and.callFake((args: any) => args)
    sanitizer.sanitize.and.returnValue({})
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
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
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LastLoginIpComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should compile', () => {
    expect(component).toBeTruthy()
  })

  it('should log JWT parsing error to console', () => {
    console.log = jasmine.createSpy('log')
    localStorage.setItem('token', 'definitelyInvalidJWT')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalled()
  })

  xit('should set Last-Login IP from JWT as trusted HTML', () => { // FIXME Expected state seems to leak over from previous test case occasionally
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({
      data: {
        lastLoginIp: '1.2.3.4'
      }
    }))
    const signature = 'test'

    const token = `${header}.${payload}.${signature}`
    localStorage.setItem('token', token)
    component.ngOnInit()
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<small>1.2.3.4</small>')
  })

  xit('should not set Last-Login IP if none is present in JWT', () => { // FIXME Expected state seems to leak over from previous test case occasionally
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({
      data: {}
    }))
    const signature = 'test'
    const token = `${header}.${payload}.${signature}`
    localStorage.setItem('token', token)
    component.ngOnInit()
    expect(sanitizer.bypassSecurityTrustHtml).not.toHaveBeenCalled()
  })
})
