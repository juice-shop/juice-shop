import { Component, OnInit } from '@angular/core'
import { OrderHistoryService } from '../Services/order-history.service'
import { MatTableDataSource } from '@angular/material/table'
import { BasketService } from '../Services/basket.service'
import { ProductDetailsComponent } from '../product-details/product-details.component'
import { MatDialog } from '@angular/material/dialog'
import { Product } from '../Models/product.model'

interface StrippedProduct {
  name: string,
  price: number,
  quantity: number,
  total: number
}

interface Order {
  orderId: string,
  totalPrice: number,
  bonus: number,
  products: MatTableDataSource<StrippedProduct>
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  public tableColumns = ['product','price','quantity','total price']
  public orders: Order[] = []

  constructor (private dialog: MatDialog, private orderHistory: OrderHistoryService, private basketService: BasketService) { }

  ngOnInit () {
    this.orderHistory.get().subscribe((orders) => {
      for (const order of orders) {
        const products: StrippedProduct[] = []
        for (const product of order.products) {
          products.push({
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            total: product.total
          })
        }
        this.orders.push({
          orderId: order.orderId,
          totalPrice: order.totalPrice,
          bonus: order.bonus,
          products: new MatTableDataSource<StrippedProduct>(products)
        })
      }
      console.log(this.orders)
    })
  }

  showDetail (element: Product) {
    this.dialog.open(ProductDetailsComponent, {
      width: '500px',
      height: 'max-content',
      data: {
        productData: element
      }
    })
  }

  openConfirmationPDF (orderId) {
    const redirectUrl = this.basketService.hostServer + '/ftp/order_' + orderId + '.pdf'
    window.open(redirectUrl,'_blank')
  }
}
