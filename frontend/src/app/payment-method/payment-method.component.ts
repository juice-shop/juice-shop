import { FormControl, Validators } from '@angular/forms'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { PaymentService } from '../Services/payment.service'
import { MatTableDataSource } from '@angular/material/table'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons/'

library.add(faPaperPlane, faTrashAlt)
dom.watch()

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss']
})

export class PaymentMethodComponent implements OnInit {

  @Output() emitSelection = new EventEmitter()
  @Input('allowDelete') public allowDelete: boolean = false
  public displayedColumns = ['Number', 'Name', 'Expiry']
  public nameControl: FormControl = new FormControl('', [Validators.required])
  public numberControl: FormControl = new FormControl('',[Validators.required, Validators.min(1000000000000000), Validators.max(9999999999999999)])
  public monthControl: FormControl = new FormControl('',[Validators.required])
  public yearControl: FormControl = new FormControl('',[Validators.required])
  public confirmation: any
  public error: any
  public storedCards: any
  public card: any = {}
  public dataSource
  public monthRange: any[]
  public yearRange: any[]
  public cardsExist: boolean = false
  public paymentId: any = undefined

  constructor (public paymentService: PaymentService) { }

  ngOnInit () {
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
    this.paymentService.get().subscribe((cards) => {
      cards.map(card => { card.cardNum = '************' + String(card.cardNum).substring(String(card.cardNum).length - 4) })
      this.cardsExist = cards.length
      this.storedCards = cards
      this.dataSource = new MatTableDataSource<Element>(this.storedCards)
    }, (err) => console.log(err))
  }

  save () {
    this.card.fullName = this.nameControl.value
    this.card.cardNum = this.numberControl.value
    this.card.expMonth = this.monthControl.value
    this.card.expYear = this.yearControl.value
    this.paymentService.save(this.card).subscribe((savedCards) => {
      this.error = null
      this.confirmation = 'Your card ending with ' + String(savedCards.cardNum).substring(String(savedCards.cardNum).length - 4) + ' has been saved for your convinience.'
      this.load()
      this.resetForm()
    }, (error) => {
      this.error = error.error
      this.confirmation = null
      this.resetForm()
    })
  }

  delete (id) {
    this.paymentService.del(id).subscribe(() => {
      this.load()
    }, (err) => console.log(err))
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
