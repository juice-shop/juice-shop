import { environment } from './../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map,catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class BasketService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/BasketItems'

  constructor (private http: HttpClient) { }

  find (id) {
    this.http.get('/rest/basket/' + id).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  get (id) {
    this.http.get(this.host + '/' + id).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  put (id, params) {
    this.http.put(this.host + '/' + id, params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  del (id) {
    this.http.delete(this.host + '/' + id).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  save (params) {
    this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  checkout (id) {
    this.http.post('/rest/basket/' + id + '/checkout',{}).pipe(map((response: any) => response.orderConfirmation), catchError((error) => { throw error }))
  }

  applyCoupon (id, coupon) {
    this.http.put('/rest/basket/' + id + '/coupon/' + coupon, {}).pipe(map((response: any) => response.discount), catchError((error) => { throw error }))
  }

}
