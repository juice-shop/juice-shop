import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class PhotoWallService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/Memorys'

  constructor (private http: HttpClient) { }

  addMemory (caption: string, image: File) {
    const postData = new FormData()
    postData.append('image', image, caption)
    postData.append('caption', caption)
    return this.http.post(this.host, postData).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  get () {
    return this.http.get(this.host + '/').pipe(map((response: any) => response.data), catchError(err => { throw err }))
  }
}
