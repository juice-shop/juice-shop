import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class VulnLinesService {
  private readonly hostServer = environment.hostServer
  private readonly hostVerdict = this.hostServer + '/verdict'
  private readonly hostStatus = this.hostServer + '/stats'

  constructor (private readonly http: HttpClient) { }

  check (key: string, selectedLines: number[]): any {
    return this.http.post(this.hostVerdict, {
      key: key,
      selectedLines: selectedLines
    }).pipe(map((response: any) => response), catchError((error: any) => { throw error }))
  }

  get (key: string): any {
    return this.http.get(`${this.hostStatus}/${key}`).pipe(map((response: any) => response), catchError((error: any) => { throw error }))
  }
}
