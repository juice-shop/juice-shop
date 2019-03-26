import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'
import { init } from './hacking-instructor'
import 'hammerjs'

if (environment.production) {
  enableProdMode()
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    setTimeout(
      init, 2000
    )
  })
  .catch(err => console.log(err))
