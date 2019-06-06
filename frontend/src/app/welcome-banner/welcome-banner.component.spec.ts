import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatSnackBarRef } from '@angular/material'
import { CookieModule, CookieService } from 'ngx-cookie'

import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WelcomeBannerComponent } from './welcome-banner.component'

describe('WelcomeBannerComponent', () => {
  let component: WelcomeBannerComponent
  let fixture: ComponentFixture<WelcomeBannerComponent>
  let cookieService
  let matSnackBarRef: MatSnackBarRef<WelcomeBannerComponent>

  beforeEach(async(() => {
    matSnackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['dismiss'])
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        HttpClientTestingModule
      ],
      declarations: [WelcomeBannerComponent],
      providers: [
       { provide: MatSnackBarRef, useValue: matSnackBarRef },
        CookieService
      ]
    })
    .compileComponents()

    cookieService = TestBed.get(CookieService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeBannerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not dismiss if cookie not set', () => {
    component.ngOnInit()
    expect(matSnackBarRef.dismiss).toHaveBeenCalledTimes(0)
  })

  it('should dismiss if cookie set', () => {
    cookieService.put('welcome-banner-status', 'dismiss')
    component.ngOnInit()
    expect(matSnackBarRef.dismiss).toHaveBeenCalled()
  })

  it('should dismiss and add cookie when closed', () => {
    component.closeWelcome()
    expect(cookieService.get('welcome-banner-status')).toBe('dismiss')
    expect(matSnackBarRef.dismiss).toHaveBeenCalled()
  })
})
