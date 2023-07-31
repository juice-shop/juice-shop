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

  nftUnlocked () {
    return this.http.get(this.host + '/nftUnlocked').pipe(
      map((response: any) => response),
      catchError((err) => {
        throw err
      })
    )
  }

  nftMinted () {
    return this.http.get(this.host + '/nftMinted').pipe(
      map((response: any) => response),
      catchError((err) => {
        throw err
      })
    )
  }

  checkNftMinted () {
    return this.http.get(this.host + '/checkNftMinted').pipe(
      map((response: any) => response),
      catchError((err) => {
        throw err
      })
    )
  }

  submitKey (privateKey: string) {
    const endpoint = this.host + '/submitKey'
    const params = { privateKey: privateKey }
    return this.http.post(endpoint, params).pipe(
      map((response: any) => response),
      catchError((err) => {
        throw err
      })
    )
  }
}
