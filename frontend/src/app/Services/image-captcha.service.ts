import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ImageCaptchaService {

  private hostServer = environment.hostServer

  constructor (private http: HttpClient) { }

  getCaptcha () {
    return this.http.get(this.hostServer + '/rest/image-captcha/').pipe(catchError((err) => { throw err }))
  }

  dataExport (params) {
    return this.http.post(this.hostServer + '/rest/data-export/', params).pipe(catchError((err) => { throw err }))
  }
}
