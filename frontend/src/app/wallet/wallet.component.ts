/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, type OnInit, inject } from '@angular/core'
import { WalletService } from '../Services/wallet.service'
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'

import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatError } from '@angular/material/form-field'
import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  imports: [MatCardModule, TranslateModule, MatFormFieldModule, MatLabel, FormsModule, MatInputModule, ReactiveFormsModule, MatError, MatButtonModule, MatIconModule]
})
export class WalletComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly walletService = inject(WalletService);
  private readonly ngZone = inject(NgZone);

  public balance: string
  public balanceControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.min(10), Validators.max(1000)])

  ngOnInit (): void {
    this.walletService.get().subscribe({
      next: (balance) => {
        this.balance = parseFloat(balance).toFixed(2)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  continue () {
    sessionStorage.setItem('walletTotal', this.balanceControl.value)
    this.ngZone.run(async () => await this.router.navigate(['/payment', 'wallet']))
  }
}
