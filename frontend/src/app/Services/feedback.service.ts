import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/Feedbacks'

  constructor (private http: HttpClient) { }

  find (params?: any) {
    return this.http.get(this.host + '/' , {
      params: params
    }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  save (params: any) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  del (id: number) {
    return this.http.delete(this.host + '/' + id).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
