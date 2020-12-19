/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { TrackResultComponent } from './track-result.component'
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card'
import { RouterTestingModule } from '@angular/router/testing'
import { TrackOrderService } from '../Services/track-order.service'

describe('TrackResultComponent', () => {
  let component: TrackResultComponent
  let fixture: ComponentFixture<TrackResultComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule,
        MatCardModule,
        MatTableModule
      ],
      declarations: [ TrackResultComponent ],
      providers: [TrackOrderService]
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
