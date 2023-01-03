/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, OnInit } from '@angular/core'
import { WalletService } from '../Services/wallet.service'
import { UntypedFormControl, Validators } from '@angular/forms'
import { Router } from '@angular/router'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
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
