import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})

export class DataSubjectService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/rest/user'

  constructor (private http: HttpClient) { }

  deactivate () {
    return this.http.get(this.host + '/erasure-request').pipe(
      map((response: any) => response),
      catchError(error => { throw error })
    )
  }
}
