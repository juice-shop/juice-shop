import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/Addresss'

  constructor (private http: HttpClient) { }

  get () {
    return this.http.get(this.host).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  getById (id) {
    return this.http.get(this.host + '/' + id).pipe(map((response: any) => response.data), catchError(err => { throw err }))
  }

  save (params) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  put (id, params) {
    return this.http.put(this.host + '/' + id, params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  del (id) {
    return this.http.delete(this.host + '/' + id).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
