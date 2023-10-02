import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { RouterModule, type Routes } from '@angular/router'
import { ConfigurationService } from '../Services/configuration.service'
import { OverlayContainer } from '@angular/cdk/overlay'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatSnackBarModule } from '@angular/material/snack-bar'

import { WalletWeb3Component } from './wallet-web3.component'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { HttpClient } from '@angular/common/http'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

const routes: Routes = [
  {
    path: '',
    component: WalletWeb3Component
  }
]

export function HttpLoaderFactory (http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

@NgModule({
  declarations: [WalletWeb3Component],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule.forRoot(
      {
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }
    ),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatSnackBarModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalletWeb3Module {
  constructor (
    public configurationService: ConfigurationService,
    public overlayContainer: OverlayContainer
  ) {
    configurationService.getApplicationConfiguration().subscribe((conf) => {
      overlayContainer
        .getContainerElement()
        .classList.add(conf.application.theme + '-theme')
    })
  }
}
