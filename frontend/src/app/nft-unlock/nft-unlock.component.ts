import { Component } from '@angular/core'
import { KeysService } from '../Services/keys.service'
import { MatDivider } from '@angular/material/divider'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field'
import { FormsModule } from '@angular/forms'
import { NgIf } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { FlexModule } from '@angular/flex-layout/flex'
import { MatCardModule, MatCardTitle } from '@angular/material/card'

@Component({
  selector: 'app-nft-unlock',
  templateUrl: './nft-unlock.component.html',
  styleUrls: ['./nft-unlock.component.scss'],
  imports: [MatCardModule, FlexModule, MatButtonModule, TranslateModule, NgIf, MatCardTitle, FormsModule, MatFormFieldModule, MatLabel, MatInputModule, MatDivider]
})
export class NFTUnlockComponent {
  privateKey: string
  formSubmitted: boolean = false
  successResponse: boolean = false
  errorMessage = ''

  constructor (private readonly keysService: KeysService) {}

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
