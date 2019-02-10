import { Injectable } from '@angular/core'
import { HttpClient, HttpResponse } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { environment } from '../../environments/environment'
import { Observable } from 'rxjs';

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
export class TwoFactorAuthServiceService {

  constructor(private http: HttpClient) {

  }

  verify(totpToken: String): Observable<AuthenticationPayload> {
    return this.http.post(`${environment.hostServer}/rest/2fa/verify`, {
      tmp_token: localStorage.getItem('totp_tmp_token'),
      totp_token: totpToken
    }).pipe(map((response: TwoFactorVerifyResponse) => response.authentication), catchError((error) => { throw error }))
  }
}
