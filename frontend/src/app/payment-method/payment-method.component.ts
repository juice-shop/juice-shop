/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Component, EventEmitter, Input, type OnInit, Output, inject } from '@angular/core'
import { PaymentService } from '../Services/payment.service'
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons/'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatError, MatHint } from '@angular/material/form-field'
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion'
import { MatIconButton, MatButtonModule } from '@angular/material/button'
import { MatRadioButton } from '@angular/material/radio'

import { MatIconModule } from '@angular/material/icon'

library.add(faPaperPlane, faTrashAlt)

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss'],
  imports: [MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatRadioButton, MatIconButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatFormFieldModule, MatLabel, TranslateModule, MatInputModule, FormsModule, ReactiveFormsModule, MatError, MatHint, MatButtonModule, MatIconModule]
})

export class PaymentMethodComponent implements OnInit {
  paymentService = inject(PaymentService);
  private readonly translate = inject(TranslateService);
  private readonly snackBarHelperService = inject(SnackBarHelperService);

  @Output() emitSelection = new EventEmitter()
  @Input() public allowDelete = false
  public displayedColumns = ['Number', 'Name', 'Expiry']
  public nameControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  // eslint-disable-next-line no-loss-of-precision
  public numberControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.min(1000000000000000), Validators.max(9999999999999999)])
  public monthControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public yearControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public confirmation: any
  public error: any
  public storedCards: any
  public card: any = {}
  public dataSource
  public monthRange: any[]
  public yearRange: any[]
  public cardsExist = false
  public paymentId: any = undefined

  ngOnInit (): void {
    this.monthRange = Array.from(Array(12).keys()).map(i => i + 1)
    this.yearRange = Array.from(Array(20).keys()).map(i => i + 2080)
    if (this.allowDelete) {
      this.displayedColumns.push('Remove')
    } else {
      this.displayedColumns.unshift('Selection')
    }
    this.load()
  }

  load () {
    this.paymentService.get().subscribe({
      next: (cards) => {
        this.cardsExist = cards.length
        this.storedCards = cards
        this.dataSource = new MatTableDataSource<Element>(this.storedCards)
      },
      error: (err) => { console.log(err) }
    })
  }

  save () {
    this.card.fullName = this.nameControl.value
    this.card.cardNum = this.numberControl.value
    this.card.expMonth = this.monthControl.value
    this.card.expYear = this.yearControl.value
    this.paymentService.save(this.card).subscribe({
      next: (savedCards) => {
        this.error = null
        this.translate.get('CREDIT_CARD_SAVED', { cardnumber: String(savedCards.cardNum).substring(String(savedCards.cardNum).length - 4) }).subscribe({
          next: (creditCardSaved) => {
            this.snackBarHelperService.open(creditCardSaved, 'confirmBar')
          },
          error: (translationId) => {
            this.snackBarHelperService.open(translationId, 'confirmBar')
          }
        })
        this.load()
        this.resetForm()
      },
      error: (err) => {
        this.snackBarHelperService.open(err.error?.error, 'errorBar')
        this.resetForm()
      }
    })
  }

  delete (id) {
    this.paymentService.del(id).subscribe({
      next: () => {
        this.load()
      },
      error: (err) => { console.log(err) }
    })
  }

  emitSelectionToParent (id: number) {
    this.emitSelection.emit(id)
  }

  resetForm () {
    this.nameControl.markAsUntouched()
    this.nameControl.markAsPristine()
    this.nameControl.setValue('')
    this.numberControl.markAsUntouched()
    this.numberControl.markAsPristine()
    this.numberControl.setValue('')
    this.monthControl.markAsUntouched()
    this.monthControl.markAsPristine()
    this.monthControl.setValue('')
    this.yearControl.markAsUntouched()
    this.yearControl.markAsPristine()
    this.yearControl.setValue('')
  }
}
