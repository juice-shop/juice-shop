/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ImageCaptchaService {
  private readonly hostServer = environment.hostServer

  constructor (private readonly http: HttpClient) { }

  getCaptcha () {
    return this.http.get(this.hostServer + '/rest/image-captcha/').pipe(catchError((err) => { throw err }))
  }
}
