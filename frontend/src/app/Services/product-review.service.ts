import { environment } from './../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map, catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ProductReviewService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/rest/product'

  constructor (private http: HttpClient) { }

  get (id) {
    return this.http.get(this.host + '/' + id + '/reviews').pipe(
      map((response: any) => response.data), catchError(err => {
        throw err
      })
    )
  }

  create (id, review) {
    return this.http.put(this.host + '/' + id + '/reviews', review).pipe(map((response: any) => response.data),
     catchError((err) => { throw err })
    )
  }

  patch (review) {
    return this.http.patch(this.host + '/reviews', review).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

}
