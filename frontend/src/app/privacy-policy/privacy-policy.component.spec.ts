/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ConfigurationService } from '../Services/configuration.service'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'

import { PrivacyPolicyComponent } from './privacy-policy.component'
import { of } from 'rxjs'

describe('PrivacyPolicyComponent', () => {
  let component: PrivacyPolicyComponent
  let fixture: ComponentFixture<PrivacyPolicyComponent>
  let configurationService: any

  beforeEach(waitForAsync(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))

    TestBed.configureTestingModule({
      declarations: [PrivacyPolicyComponent],
      imports: [
        HttpClientTestingModule,
        MatCardModule,
        MatDividerModule
      ],
      providers: [
        { provide: ConfigurationService, useValue: configurationService }
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyPolicyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should compile', () => {
    expect(component).toBeTruthy()
  })
})
