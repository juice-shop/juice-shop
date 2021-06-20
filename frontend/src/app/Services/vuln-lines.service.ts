import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class VulnLinesService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/verdict'

  constructor (private readonly http: HttpClient) { }

  check (key: any, selectedLines: number[]): any {
    return this.http.post(this.host, {
      key: key,
      selectedLines: selectedLines
    }).pipe(map((response: any) => response), catchError((error: any) => { throw error }))
  }
}
