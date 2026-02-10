import { Component, inject, OnInit } from '@angular/core'
import { KeysService } from '../Services/keys.service'
import { MatDivider } from '@angular/material/divider'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field'
import { FormsModule } from '@angular/forms'

import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'

import { MatCardModule, MatCardTitle } from '@angular/material/card'

@Component({
  selector: 'app-nft-unlock',
  templateUrl: './nft-unlock.component.html',
  styleUrls: ['./nft-unlock.component.scss'],
  imports: [MatCardModule, MatButtonModule, TranslateModule, MatCardTitle, FormsModule, MatFormFieldModule, MatLabel, MatInputModule, MatDivider]
})
export class NFTUnlockComponent implements OnInit {
  private readonly keysService = inject(KeysService);

  privateKey: string
  formSubmitted = false
  successResponse = false
  errorMessage = ''

  // Params for translation with HTML link
  i18nParams = {
    link: '<a target="_blank" rel="noopener noreferrer" href="https://testnets.opensea.io/assets/mumbai/0xf4817631372dca68a25a18eb7a0b36d54f3dbcf7/0">Opensea</a>'
  }

  ngOnInit (): void {
    this.checkChallengeStatus()
  }

  checkChallengeStatus () {
    this.keysService.nftUnlocked().subscribe({
      next:
      (response) => {
        this.successResponse = response.status
      },
      error: (error) => {
        console.error(error)
        this.successResponse = false
      }
    }
    )
  }

  submitForm () {
    this.formSubmitted = true
    this.keysService.submitKey(this.privateKey).subscribe({
      next:
      (response) => {
        if (response.success) {
          this.successResponse = true
          this.errorMessage = response.message
        } else {
          this.successResponse = false
        }
      },
      error: (error) => {
        this.successResponse = false
        this.errorMessage = error.error.message
      }
    }
    )
  }
}
