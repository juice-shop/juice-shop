import { environment } from './../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { map,catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/Challenges'
  constructor (private http: HttpClient) { }

  find (params) {
    return this.http.get(this.host + '/', { params: params }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  repeatNotification (challengeName) {
    return this.http.get('/rest/repeat-notification', { params: { challenge: challengeName } })
  }

  continueCode () {
    return this.http.get('/rest/continue-code').pipe(map((response: any) => response.continueCode),catchError((err) => { throw err }))
  }

  restoreProgress (continueCode) {
    return this.http.put('/rest/continue-code/apply/' + continueCode, {})
  }
}
