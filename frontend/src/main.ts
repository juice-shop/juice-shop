import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'
import 'hammerjs'

export function pressEnterHandler (loginForm, loginFunc, isEnabled) {
  document.getElementById(loginForm)
    .addEventListener('keyup', function (event) {
      event.preventDefault()
      if (event.keyCode === 13 && isEnabled()) {
        loginFunc()
      }
    })
}

if (environment.production) {
  enableProdMode()
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err))
