import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss']
})
export class OrderSummaryComponent implements OnInit {

  public bonus = 0
  public itemTotal = 0
  public deliveryPrice = 0
  public promotionalDiscount = 0

  // constructor () { }

  // tslint:disable-next-line:no-empty
  ngOnInit () {
  }

  getMessage (total) {
    this.itemTotal = total[0]
    this.bonus = total[1]
  }
}
