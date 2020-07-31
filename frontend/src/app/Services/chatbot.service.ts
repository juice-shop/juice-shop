import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private hostServer = environment.hostServer
  private host = this.hostServer + '/rest/chatbot'

  constructor (private http: HttpClient) { }

  getChatbotStatus () {
    return this.http.get(this.host + '/status').pipe(map((response: any) => response), catchError(error => { throw error }))
  }

  getResponse (action, query) {
    return this.http.post(this.host + '/respond', { action: action, query: query }).pipe(map((response: any) => response), catchError(error => { throw error }))
  }
}
