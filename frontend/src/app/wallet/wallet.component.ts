/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, type OnInit } from '@angular/core'
import { WalletService } from '../Services/wallet.service'
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { MatButton } from '@angular/material/button'
import { NgIf } from '@angular/common'
import { MatInput } from '@angular/material/input'
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field'
import { TranslateModule } from '@ngx-translate/core'
import { MatCard } from '@angular/material/card'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  standalone: true,
  imports: [MatCard, TranslateModule, MatFormField, MatLabel, FormsModule, MatInput, ReactiveFormsModule, NgIf, MatError, MatButton]
})
export class WalletComponent implements OnInit {
  public balance: string
  public balanceControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.min(10), Validators.max(1000)])

  constructor (private readonly router: Router, private readonly walletService: WalletService, private readonly ngZone: NgZone) { }

  ngOnInit () {
    this.walletService.get().subscribe((balance) => {
      this.balance = parseFloat(balance).toFixed(2)
    }, (err) => {
      console.log(err)
    })
  }

  continue () {
    sessionStorage.setItem('walletTotal', this.balanceControl.value)
    this.ngZone.run(async () => await this.router.navigate(['/payment', 'wallet']))
  }
}
