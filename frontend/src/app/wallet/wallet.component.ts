import { Component, OnInit } from '@angular/core'
import { WalletService } from '../Services/wallet.service'
import { FormControl, Validators } from '@angular/forms'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  public balance: Number
  public balanceControl: FormControl = new FormControl('', [Validators.required, Validators.min(10),Validators.max(1000)])

  constructor (private walletService: WalletService) { }

  ngOnInit () {
    this.walletService.get().subscribe((balance) => {
      this.balance = balance
    },(err) => {
      console.log(err)
    })
  }

  continue () {
    this.walletService.put({ balance: this.balanceControl.value }).subscribe(() => {
      this.ngOnInit()
      this.resetForm()
    },(err) => {
      this.resetForm()
      console.log(err)
    })
  }

  resetForm () {
    this.balanceControl.markAsUntouched()
    this.balanceControl.markAsPristine()
    this.balanceControl.setValue('')
  }
}
