import { Component } from '@angular/core'
import { KeysService } from '../Services/keys.service'

@Component({
  selector: 'app-nft-unlock',
  templateUrl: './nft-unlock.component.html',
  styleUrls: ['./nft-unlock.component.scss']
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
