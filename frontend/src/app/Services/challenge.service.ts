/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { type Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { type Challenge } from '../Models/challenge.model'
import {throwError} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Challenges'

  find (params?: any): Observable<Challenge[]> {
    return this.http.get(this.host + '/', { params }).pipe(map((response: any) => response.data), catchError(err=>throwError(()=>err)))
  }

  repeatNotification (challengeName: string) {
    return this.http.get(this.hostServer + '/rest/repeat-notification', { params: { challenge: challengeName }, responseType: 'text' as const }).pipe(catchError(err=>throwError(()=>err)))
  }

  continueCode () {
    return this.http.get(this.hostServer + '/rest/continue-code').pipe(map((response: any) => response.continueCode), catchError(err=>throwError(()=>err)))
  }

  continueCodeFindIt () {
    return this.http.get(this.hostServer + '/rest/continue-code-findIt').pipe(map((response: any) => response.continueCode), catchError(err=>throwError(()=>err)))
  }

  continueCodeFixIt () {
    return this.http.get(this.hostServer + '/rest/continue-code-fixIt').pipe(map((response: any) => response.continueCode), catchError(err=>throwError(()=>err)))
  }

  restoreProgress (continueCode: string) {
    return this.http.put(this.hostServer + '/rest/continue-code/apply/' + continueCode, {}).pipe(map((response: any) => response.data), catchError(err=>throwError(()=>err)))
  }

  restoreProgressFindIt (continueCode: string) {
    return this.http.put(this.hostServer + '/rest/continue-code-findIt/apply/' + continueCode, {}).pipe(map((response: any) => response.data), catchError(err=>throwError(()=>err)))
  }

  restoreProgressFixIt (continueCode: string) {
    return this.http.put(this.hostServer + '/rest/continue-code-fixIt/apply/' + continueCode, {}).pipe(map((response: any) => response.data), catchError(err=>throwError(()=>err)))
  }
}
