/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { Status, TrackResultComponent } from './track-result.component'
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card'
import { RouterTestingModule } from '@angular/router/testing'
import { TrackOrderService } from '../Services/track-order.service'
import { DomSanitizer } from '@angular/platform-browser'
import { of } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('TrackResultComponent', () => {
  let component: TrackResultComponent
  let fixture: ComponentFixture<TrackResultComponent>
  let trackOrderService: any
  let sanitizer: any

  beforeEach(waitForAsync(() => {
    trackOrderService = jasmine.createSpyObj('TrackOrderService', ['find'])
    trackOrderService.find.and.returnValue(of({ data: [{ }] }))
    sanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml', 'sanitize'])
    sanitizer.bypassSecurityTrustHtml.and.callFake((args: any) => args)
    sanitizer.sanitize.and.returnValue({})

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        RouterTestingModule,
        MatCardModule,
        MatTableModule,
        TrackResultComponent],
      providers: [
        { provide: TrackOrderService, useValue: trackOrderService },
        { provide: DomSanitizer, useValue: sanitizer },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackResultComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should consider order number as trusted HTML', () => {
    component.orderId = '<a src="link">Link</a>'
    trackOrderService.find.and.returnValue(of({ data: [{ orderId: component.orderId }] }))
    component.ngOnInit()

    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<code><a src="link">Link</a></code>')
  })

  it('should set "delivered" status for delivered orders', () => {
    trackOrderService.find.and.returnValue(of({ data: [{ delivered: true }] }))
    component.ngOnInit()

    expect(component.status).toBe(Status.Delivered)
  })

  it('should set "packing" status for undelivered orders with ETA over 2 days', () => {
    trackOrderService.find.and.returnValue(of({ data: [{ eta: 3 }] }))
    component.ngOnInit()

    expect(component.status).toBe(Status.Packing)
  })

  it('should set "transit" status for undelivered orders with ETA under 3 days', () => {
    trackOrderService.find.and.returnValue(of({ data: [{ eta: 2 }] }))
    component.ngOnInit()

    expect(component.status).toBe(Status.Transit)
  })
})
