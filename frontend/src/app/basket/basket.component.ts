import { BasketService } from './../Services/basket.service'
import { Component,OnInit } from '@angular/core'

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css']
})
export class BasketComponent implements OnInit {
  public displayedColumns = ['product','description','price','quantity','total price','remove']
  public dataSource = []
  public products: any

  constructor (private basketService: BasketService) {}

  ngOnInit () {
    this.load()
  }

  load () {
    this.basketService.find(sessionStorage.getItem('bid')).subscribe((basket) => {
      this.dataSource = basket.Products
    })
  }
}
