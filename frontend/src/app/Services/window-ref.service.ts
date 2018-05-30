import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class WindowRefService {

  get nativeWindow (): any {
    return getWindow()
  }

}

function getWindow (): any {
  return window
}
