import { Inject, Injectable } from '@angular/core'
import { DOCUMENT } from '@angular/common'

@Injectable({
  providedIn: 'root'
})
export class FormSubmitService {

  constructor (@Inject(DOCUMENT) private _document: HTMLDocument) { }

  attachEnterKeyHandler (formId, submitButtonId, onSubmit) {
    const form = this._document.getElementById(formId)
    const submitButton = this._document.getElementById(submitButtonId) as HTMLInputElement

    form.addEventListener('keyup', function (event) {
      event.preventDefault()
      // tslint:disable-next-line:deprecation
      if (event.keyCode === 13 && !submitButton.disabled) {
        onSubmit()
      }
    })
  }
}
