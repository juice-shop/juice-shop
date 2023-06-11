import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
  })
export class KeysService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/web3'

  constructor (private readonly http: HttpClient) {}

  submitKey (privateKey: string) {
    const endpoint = this.host + '/submitKey'
    const params = { privateKey: privateKey }
    return this.http.post(endpoint, params).pipe(
      map((response: any) => response.data),
      catchError((err) => {
        throw err
      })
    )
  }
}
