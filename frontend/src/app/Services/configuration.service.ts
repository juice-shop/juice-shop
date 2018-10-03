import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map, catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/rest/admin'
  constructor (private http: HttpClient) { }

  getApplicationConfiguration () {
    return this.http.get(this.host + '/application-configuration').pipe(map((response: any) => response.config, catchError((err) => { throw err })))
  }
}
