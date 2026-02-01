import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { environment } from '../../environments/environment'
import {throwError} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class KeysService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/web3'

  nftUnlocked () {
    return this.http.get(this.host + '/nftUnlocked').pipe(
      map((response: any) => response),
      catchError(err=>throwError(()=>err))
    )
  }

  nftMintListen () {
    return this.http.get(this.host + '/nftMintListen').pipe(
      map((response: any) => response),
      catchError(err=>throwError(()=>err))
    )
  }

  checkNftMinted () {
    return this.http.get(this.hostServer + '/api/Challenges/?key=nftMintChallenge').pipe(
      map((response: any) => response),
      catchError(err=>throwError(()=>err))
    )
  }

  submitKey (privateKey: string) {
    const endpoint = this.host + '/submitKey'
    const params = { privateKey }
    return this.http.post(endpoint, params).pipe(
      map((response: any) => response),
      catchError(err=>throwError(()=>err))
    )
  }

  verifyNFTWallet (walletAddress: string) {
    const endpoint = this.host + '/walletNFTVerify'
    const params = { walletAddress }
    return this.http.post(endpoint, params).pipe(
      map((response: any) => response),
      catchError(err=>throwError(()=>err))
    )
  }

  walletAddressSend (walletAddress: string) {
    const endpoint = this.host + '/walletExploitAddress'
    const params = { walletAddress }
    return this.http.post(endpoint, params).pipe(
      map((response: any) => response),
      catchError(err=>throwError(()=>err))
    )
  }
}
