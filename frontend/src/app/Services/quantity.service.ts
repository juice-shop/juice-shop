import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class QuantityService {
  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/Quantitys'

  constructor (private http: HttpClient) { }

  getAll () {
    return this.http.get(this.host + '/').pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  put (id, params) {
    return this.http.put(this.host + '/' + id, params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

}
