import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { environment } from '../../environments/environment'
import { Observable } from 'rxjs'

interface TwoFactorVerifyResponse {
  authentication: AuthenticationPayload
}

interface AuthenticationPayload {
  token: string,
  bid: number,
  umail: string
}

@Injectable({
  providedIn: 'root'
})
export class TwoFactorAuthService {

  constructor (private http: HttpClient) {

  }

  verify (totpToken: String): Observable<AuthenticationPayload> {
    return this.http.post(`${environment.hostServer}/rest/2fa/verify`, {
      tmpToken: localStorage.getItem('totp_tmp_token'),
      totpToken: totpToken
    }).pipe(map((response: TwoFactorVerifyResponse) => response.authentication), catchError((error) => { throw error }))
  }
}
