/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable, inject } from '@angular/core'
import { DOCUMENT } from '@angular/common'

@Injectable({
  providedIn: 'root'
})
export class FormSubmitService {
  private readonly _document = inject<HTMLDocument>(DOCUMENT);


  attachEnterKeyHandler (formId: string, submitButtonId: string, onSubmit: any) {
    const form = this._document.getElementById(formId) as HTMLFormElement
    const submitButton = this._document.getElementById(submitButtonId) as HTMLInputElement

    form.addEventListener('keyup', function (event) {
      event.preventDefault()
      if (event.keyCode === 13 && !submitButton.disabled) {
        onSubmit()
      }
    })
  }
}
