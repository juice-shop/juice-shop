/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Challenges'
  constructor (private readonly http: HttpClient) { }

  find (params?: any) {
    return this.http.get(this.host + '/', { params: params }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  repeatNotification (challengeName: string) {
    return this.http.get(this.hostServer + '/rest/repeat-notification', { params: { challenge: challengeName } }).pipe(catchError((err) => { throw err }))
  }

  continueCode () {
    return this.http.get(this.hostServer + '/rest/continue-code').pipe(map((response: any) => response.continueCode), catchError((err) => { throw err }))
  }

  continueCodeFindIt () {
    return this.http.get(this.hostServer + '/rest/continue-code-findIt').pipe(map((response: any) => response.continueCode), catchError((err) => { throw err }))
  }

  continueCodeFixIt () {
    return this.http.get(this.hostServer + '/rest/continue-code-fixIt').pipe(map((response: any) => response.continueCode), catchError((err) => { throw err }))
  }

  restoreProgress (continueCode: string) {
    return this.http.put(this.hostServer + '/rest/continue-code/apply/' + continueCode, {}).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  restoreProgressFindIt (continueCode: string) {
    return this.http.put(this.hostServer + '/rest/continue-code-findIt/apply/' + continueCode, {}).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  restoreProgressFixIt (continueCode: string) {
    return this.http.put(this.hostServer + '/rest/continue-code-fixIt/apply/' + continueCode, {}).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
