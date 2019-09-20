import { environment } from 'src/environments/environment'
import { Injectable, NgZone } from '@angular/core'
import * as io from 'socket.io-client'

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {

  public io = io
  private _socket: any

  constructor (private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      if (environment.hostServer === '.') {
        this._socket = this.io.connect({
          path: window.location.pathname
        })
      } else {
        this._socket = this.io.connect(environment.hostServer)
      }
    })
  }

  socket () {
    return this._socket
  }
}
