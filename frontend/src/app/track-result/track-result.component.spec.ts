/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { TrackResultComponent } from './track-result.component'
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card'
import { RouterTestingModule } from '@angular/router/testing'
import { TrackOrderService } from '../Services/track-order.service'
import { DomSanitizer } from '@angular/platform-browser'
import { of } from 'rxjs'

describe('TrackResultComponent', () => {
  let component: TrackResultComponent
  let fixture: ComponentFixture<TrackResultComponent>
  let trackOrderService: any
  let sanitizer: any

  beforeEach(waitForAsync(() => {
    trackOrderService = jasmine.createSpyObj('TrackOrderService', ['find'])
    trackOrderService.find.and.returnValue(of({ data: [] }))
    sanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml', 'sanitize'])
    sanitizer.bypassSecurityTrustHtml.and.callFake((args: any) => args)
    sanitizer.sanitize.and.returnValue({})

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule,
        MatCardModule,
        MatTableModule
      ],
      declarations: [TrackResultComponent],
      providers: [
        { provide: TrackOrderService, useValue: trackOrderService },
        { provide: DomSanitizer, useValue: sanitizer }
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
})
