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

import { Web3SandboxComponent } from './web3-sandbox.component'
import { CodemirrorModule } from '@ctrl/ngx-codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/markdown/markdown'
import 'codemirror-solidity/solidity'
import { TranslateModule } from '@ngx-translate/core'

const routes: Routes = [
  {
    path: '',
    component: Web3SandboxComponent
  }
]

@NgModule({
  imports: [
    CodemirrorModule,
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatSnackBarModule,
    Web3SandboxComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Web3SandboxModule {
  configurationService = inject(ConfigurationService);
  overlayContainer = inject(OverlayContainer);

  constructor () {
    const configurationService = this.configurationService;
    const overlayContainer = this.overlayContainer;

    configurationService.getApplicationConfiguration().subscribe((conf) => {
      overlayContainer
        .getContainerElement()
        .classList.add(conf.application.theme + '-theme')
    })
  }
}
