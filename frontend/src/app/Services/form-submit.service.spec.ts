/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { DOCUMENT } from '@angular/common'
import { FormSubmitService } from './form-submit.service'

describe('FormSubmitService', () => {
  let service: FormSubmitService
  let documentMock: Document

  beforeEach(() => {
    documentMock = document.implementation.createHTMLDocument()
    TestBed.configureTestingModule({
      providers: [
        FormSubmitService,
        { provide: DOCUMENT, useValue: documentMock }
      ]
    })
    service = TestBed.inject(FormSubmitService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should attach keyup event listener to the form', () => {
    const form = documentMock.createElement('form')
    form.id = 'testForm'
    documentMock.body.appendChild(form)

    const submitButton = documentMock.createElement('input')
    submitButton.id = 'submitButton'
    documentMock.body.appendChild(submitButton)

    const onSubmit = jasmine.createSpy('onSubmit')
    service.attachEnterKeyHandler('testForm', 'submitButton', onSubmit)

    const event = new KeyboardEvent('keyup', { keyCode: 13 })
    form.dispatchEvent(event)

    expect(onSubmit).toHaveBeenCalled()
  })

  it('should submit form when Enter key is pressed and submit button is not disabled', () => {
    const form = documentMock.createElement('form')
    form.id = 'testForm'
    documentMock.body.appendChild(form)

    const submitButton = documentMock.createElement('input')
    submitButton.id = 'submitButton'
    submitButton.disabled = false
    documentMock.body.appendChild(submitButton)

    const onSubmit = jasmine.createSpy('onSubmit')
    service.attachEnterKeyHandler('testForm', 'submitButton', onSubmit)

    const event = new KeyboardEvent('keyup', { keyCode: 13 })
    form.dispatchEvent(event)

    expect(onSubmit).toHaveBeenCalled()
  })

  it('should not submit form when Enter key is pressed but submit button is disabled', () => {
    const form = documentMock.createElement('form')
    form.id = 'testForm'
    documentMock.body.appendChild(form)

    const submitButton = documentMock.createElement('input')
    submitButton.id = 'submitButton'
    submitButton.disabled = true
    documentMock.body.appendChild(submitButton)

    const onSubmit = jasmine.createSpy('onSubmit')
    service.attachEnterKeyHandler('testForm', 'submitButton', onSubmit)

    const event = new KeyboardEvent('keyup', { keyCode: 13 })
    form.dispatchEvent(event)

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
