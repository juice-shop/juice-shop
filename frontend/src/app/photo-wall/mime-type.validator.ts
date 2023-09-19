/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type AbstractControl } from '@angular/forms'
import { Observable, type Observer, of } from 'rxjs'

export const mimeType = (
  control: AbstractControl
): Promise<Record<string, any>> | Observable<Record<string, any>> => {
  if (typeof (control.value) === 'string') {
    return of(null)
  }
  const file = control.value as File
  const fileReader = new FileReader()
  const frObs = new Observable(
    (observer: Observer<Record<string, any>>) => {
      fileReader.addEventListener('loadend', () => {
        const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4)
        let header = ''
        let isValid = false
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16)
        }
        switch (header) {
          case '89504e47':
            isValid = true
            break
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            isValid = true
            break
          default:
            isValid = false
            break
        }
        if (isValid) {
          observer.next(null)
        } else {
          observer.next({ invalidMimeType: true })
        }
        observer.complete()
      })
      fileReader.readAsArrayBuffer(file)
    }
  )
  return frObs
}
