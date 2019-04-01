import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {

  private hostServer = environment.hostServer
  constructor (private http: HttpClient) { }

  getLanguages () {
    return this.http.get(`${this.hostServer}/rest/languages`).pipe(catchError((err) => { throw err }))
  }
}
