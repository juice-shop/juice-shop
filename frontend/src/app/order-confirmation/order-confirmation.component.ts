import { Component, OnInit } from '@angular/core'
import { BasketService } from '../Services/basket.service'

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {

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
      let bonusPoints = 0
      basket.Products.map(product => {
        if (product.BasketItem && product.BasketItem.quantity) {
          bonusPoints += Math.round(product.price / 10) * product.BasketItem.quantity
          this.itemTotal += product.price * product.BasketItem.quantity
        }
      })
      this.bonus = bonusPoints
    },(err) => console.log(err))
  }
}
