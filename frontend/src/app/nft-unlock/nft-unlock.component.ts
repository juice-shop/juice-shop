import { Component } from '@angular/core'
import { KeysService } from '../Services/keys.service'
import { MatDivider } from '@angular/material/divider'
import { MatInput } from '@angular/material/input'
import { MatFormField, MatLabel } from '@angular/material/form-field'
import { FormsModule } from '@angular/forms'
import { NgIf } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MatButton } from '@angular/material/button'
import { FlexModule } from '@angular/flex-layout/flex'
import { MatCard, MatCardTitle } from '@angular/material/card'

@Component({
  selector: 'app-nft-unlock',
  templateUrl: './nft-unlock.component.html',
  styleUrls: ['./nft-unlock.component.scss'],
  standalone: true,
  imports: [MatCard, FlexModule, MatButton, TranslateModule, NgIf, MatCardTitle, FormsModule, MatFormField, MatLabel, MatInput, MatDivider]
})
export class NFTUnlockComponent {
  privateKey: string
  formSubmitted: boolean = false
  successResponse: boolean = false
  errorMessage = ''

  constructor (private readonly keysService: KeysService) {}

  ngOnInit () {
    this.checkChallengeStatus()
  }

  checkChallengeStatus () {
    this.keysService.nftUnlocked().subscribe(
      (response) => {
        this.successResponse = response.status
      },
      (error) => {
        console.error(error)
        this.successResponse = false
      }
    )
  }

  submitForm () {
    this.formSubmitted = true
    this.keysService.submitKey(this.privateKey).subscribe(
      (response) => {
        if (response.success) {
          this.successResponse = true
          this.errorMessage = response.message
        } else {
          this.successResponse = false
        }
      },
      (error) => {
        this.successResponse = false
        this.errorMessage = error.error.message
      }
    )
  }
}
