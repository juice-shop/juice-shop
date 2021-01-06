/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { SlideshowModule } from 'ng-simple-slideshow'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { AboutComponent } from './about.component'
import { MatCardModule } from '@angular/material/card'

xdescribe('AboutComponent', () => { // FIXME https://github.com/dockleryxk/ng-simple-slideshow/issues/70
  let component: AboutComponent
  let fixture: ComponentFixture<AboutComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SlideshowModule,
        MatCardModule
      ],
      declarations: [AboutComponent]
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
})
