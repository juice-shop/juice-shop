import { Injectable, inject } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

export interface result {
  verdict: boolean
  hint: string
}

@Injectable({
  providedIn: 'root'
})
export class VulnLinesService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/snippets/verdict'

  check (key: string, selectedLines: number[]): any {
    return this.http.post(this.host, {
      key,
      selectedLines
    }).pipe(map((response: result) => response), catchError((error: any) => { throw error }))
  }
}
