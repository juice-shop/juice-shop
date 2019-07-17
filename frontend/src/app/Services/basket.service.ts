import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

interface OrderDetail {
  paymentId: string,
  addressId: string,
  deliveryMethodId: string
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {

  public hostServer = environment.hostServer
  private host = this.hostServer + '/api/BasketItems'

  constructor (private http: HttpClient) { }

  find (id?: number) {
    return this.http.get(this.hostServer + '/rest/basket/' + id).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  get (id: number) {
    return this.http.get(this.host + '/' + id).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  put (id: number, params: any) {
    return this.http.put(this.host + '/' + id, params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  del (id: number) {
    return this.http.delete(this.host + '/' + id).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  save (params?: any) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  checkout (id?: number, couponData?: string, orderDetails?: OrderDetail) {
    return this.http.post(this.hostServer + '/rest/basket/' + id + '/checkout',{ 'couponData': couponData, 'orderDetails': orderDetails }).pipe(map((response: any) => response.orderConfirmation), catchError((error) => { throw error }))
  }

  applyCoupon (id?: number, coupon?: string) {
    return this.http.put(this.hostServer + '/rest/basket/' + id + '/coupon/' + coupon, {}).pipe(map((response: any) => response.discount), catchError((error) => { throw error }))
  }

}
