import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/rest/admin'
  private configObservable
  constructor (private http: HttpClient) { }

  getApplicationConfiguration () {
    if (this.configObservable) {
      return this.configObservable
    } else {
      this.configObservable = this.http.get(this.host + '/application-configuration').pipe(map((response: any) => response.config, catchError((err) => { throw err })))
      return this.configObservable
    }
  }
}
