import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/rest/admin'

  constructor (private http: HttpClient) { }

  getApplicationVersion () {
    return this.http.get(this.host + '/application-version').pipe(
      map((response: any) => response.version),
      catchError(error => { throw error })
    )
  }

}
