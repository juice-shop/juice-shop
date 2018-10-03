import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class CountryMappingService {

  private hostServer = environment.hostServer
  constructor (private http: HttpClient) { }

  getCountryMapping () {
    return this.http.get(this.hostServer + '/rest/country-mapping').pipe(catchError((err) => { throw err }))
  }
}
