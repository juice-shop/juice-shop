import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/rest/order-history'

  constructor (private http: HttpClient) { }

  get () {
    return this.http.get(this.host).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  getAll () {
    return this.http.get(this.host + '/orders').pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  toggleDeliveryStatus (id, params) {
    return this.http.put(this.host + '/' + id + '/delivery-status', params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
