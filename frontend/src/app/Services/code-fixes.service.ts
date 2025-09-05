import { Injectable, inject } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { type Observable } from 'rxjs'

export interface result {
  verdict: boolean
}

export interface Fixes {
  fixes: string[]
}

export interface Solved {
  challenges: string[]
}

@Injectable({
  providedIn: 'root'
})
export class CodeFixesService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/snippets/fixes'

  get (key: string): Observable<Fixes> {
    return this.http.get(this.host + `/${key}`).pipe(map((response: Fixes) => response), catchError((error: any) => { throw error }))
  }

  check (key: string, selectedFix: number): any {
    return this.http.post(this.host, {
      key,
      selectedFix
    }).pipe(map((response: result) => response), catchError((error: any) => { throw error }))
  }
}
