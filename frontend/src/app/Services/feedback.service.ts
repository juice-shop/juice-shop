import { environment } from './../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map, catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/Feedbacks'

  constructor (private http: HttpClient) { }

  find (params) {
    return this.http.get(this.host + '/' , {
      params: params
    }).pipe(map((response: any) => response.data), catchError((err) => err))
  }

  save (params) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  del (id) {
    return this.http.delete(this.host + '/' + id).pipe(map((response: any) => response.data), catchError((err) => err))
  }
}
