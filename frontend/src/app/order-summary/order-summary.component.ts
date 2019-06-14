import { Component, OnInit } from '@angular/core'
import { BasketService } from '../Services/basket.service'

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss']
})
export class OrderSummaryComponent implements OnInit {

  public tableColumns = ['image', 'product','price','quantity','total price']
  public dataSource
  public bonus = 0
  public itemTotal = 0
  public deliveryPrice = 0
  public promotionalDiscount = 0

  constructor (private basketService: BasketService) { }

  ngOnInit () {
    this.basketService.find(sessionStorage.getItem('bid')).subscribe((basket) => {
      this.dataSource = basket.Products
      this.itemTotal = basket.Products.reduce((itemTotal, product) => itemTotal + product.price * product.BasketItem.quantity, 0)
      this.bonus = basket.Products.reduce((bonusPoints, product) => bonusPoints + Math.round(product.price / 10) * product.BasketItem.quantity, 0)
    },(err) => console.log(err))
  }
}
