import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from 'src/environments/environment'
import { map, catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class SecurityQuestionService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/SecurityQuestions'

  constructor (private http: HttpClient) { }

  find (params) {
    return this.http.get(this.host + '/', { params: params }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  findBy (email) {
    return this.http.get(this.hostServer + '/' + 'rest/user/security-question?email=' + email).pipe(
      map((response: any) => response.question),
      catchError((error) => { throw error })
    )
  }
}
