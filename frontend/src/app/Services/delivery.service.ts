import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { DeliveryMethod } from '../Models/deliveryMethod.model'

interface DeliveryMultipleMethodResponse {
  status: string,
  data: DeliveryMethod[]
}

interface DeliverySingleMethodResponse {
  status: string,
  data: DeliveryMethod
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/Deliverys'

  constructor (private http: HttpClient) { }

  get () {
    return this.http.get(this.host).pipe(map((response: DeliveryMultipleMethodResponse) => response.data), catchError((err) => { throw err }))
  }

  getById (id) {
    return this.http.get(this.host + '/' + id).pipe(map((response: DeliverySingleMethodResponse) => response.data), catchError((err) => { throw err }))
  }
}
