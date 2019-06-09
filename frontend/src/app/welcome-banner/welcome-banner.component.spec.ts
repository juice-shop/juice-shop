import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatDialogRef } from '@angular/material'
import { CookieModule, CookieService } from 'ngx-cookie'

import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WelcomeBannerComponent } from './welcome-banner.component'

describe('WelcomeBannerComponent', () => {
  let component: WelcomeBannerComponent
  let fixture: ComponentFixture<WelcomeBannerComponent>
  let cookieService
  let matDialogRef: MatDialogRef<WelcomeBannerComponent>

  beforeEach(async(() => {
    matDialogRef = jasmine.createSpyObj('MatDialogRef', ['close'])
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        HttpClientTestingModule
      ],
      declarations: [WelcomeBannerComponent],
      providers: [
       { provide: MatDialogRef, useValue: matDialogRef },
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
    expect(matDialogRef.close).toHaveBeenCalledTimes(0)
  })

  it('should dismiss if cookie set', () => {
    cookieService.put('welcome-banner-status', 'dismiss')
    component.ngOnInit()
    expect(matDialogRef.close).toHaveBeenCalled()
  })

  it('should dismiss and add cookie when closed', () => {
    component.closeWelcome()
    expect(cookieService.get('welcome-banner-status')).toBe('dismiss')
    expect(matDialogRef.close).toHaveBeenCalled()
  })
})
