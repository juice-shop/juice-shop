/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { inject, TestBed } from '@angular/core/testing'

import { FormSubmitService } from './form-submit.service'

describe('FormSubmitService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormSubmitService]
    })
  })

  it('should be created', inject([FormSubmitService], (service: FormSubmitService) => {
    expect(service).toBeTruthy()
  }))
})
