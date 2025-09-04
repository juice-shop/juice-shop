import { NgModule, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { RouterModule, type Routes } from '@angular/router'
import { ConfigurationService } from '../Services/configuration.service'
import { OverlayContainer } from '@angular/cdk/overlay'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatSnackBarModule } from '@angular/material/snack-bar'

import { FaucetComponent } from './faucet.component'
import { TranslateModule } from '@ngx-translate/core'

const routes: Routes = [
  {
    path: '',
    component: FaucetComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatSnackBarModule,
    FaucetComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FaucetModule {
  configurationService = inject(ConfigurationService);
  overlayContainer = inject(OverlayContainer);

  constructor () {
    const configurationService = this.configurationService;
    const overlayContainer = this.overlayContainer;

    configurationService.getApplicationConfiguration().subscribe((conf) => {
      overlayContainer.getContainerElement().classList.add(conf.application.theme + '-theme')
    })
  }
}
