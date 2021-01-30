/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { SlideshowModule } from 'ng-simple-slideshow'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { AboutComponent } from './about.component'
import { MatCardModule } from '@angular/material/card'
import { NO_ERRORS_SCHEMA } from '@angular/core'

describe('AboutComponent', () => {
  let component: AboutComponent
  let fixture: ComponentFixture<AboutComponent>
  let slideshowModule

  beforeEach(waitForAsync(() => {
    slideshowModule = jasmine.createSpy('SlideshowModule') // FIXME Replace with actual import if https://github.com/dockleryxk/ng-simple-slideshow/issues/70 gets fixed

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        HttpClientTestingModule,
        MatCardModule
      ],
      declarations: [AboutComponent],
      providers: [
        { provide: SlideshowModule, useValue: slideshowModule }
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
})
