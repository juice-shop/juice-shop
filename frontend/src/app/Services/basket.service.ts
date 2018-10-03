import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class BasketService {

  public hostServer = environment.hostServer
  private host = this.hostServer + '/api/BasketItems'

  constructor (private http: HttpClient) { }

  find (id) {
    return this.http.get(this.hostServer + '/rest/basket/' + id).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  get (id) {
    return this.http.get(this.host + '/' + id).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  put (id, params) {
    return this.http.put(this.host + '/' + id, params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  del (id) {
    return this.http.delete(this.host + '/' + id).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  save (params?: any) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  checkout (id) {
    return this.http.post(this.hostServer + '/rest/basket/' + id + '/checkout',{}).pipe(map((response: any) => response.orderConfirmation), catchError((error) => { throw error }))
  }

  applyCoupon (id, coupon) {
    return this.http.put(this.hostServer + '/rest/basket/' + id + '/coupon/' + coupon, {}).pipe(map((response: any) => response.discount), catchError((error) => { throw error }))
  }

}
