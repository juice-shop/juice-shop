import { Component, OnInit } from '@angular/core'
import { OrderHistoryService } from '../Services/order-history.service'
import { MatTableDataSource } from '@angular/material/table'
import { BasketService } from '../Services/basket.service'
import { ProductDetailsComponent } from '../product-details/product-details.component'
import { MatDialog } from '@angular/material/dialog'
import { Product } from '../Models/product.model'
import { ProductService } from '../Services/product.service'
import { Router } from '@angular/router'

export interface StrippedProduct {
  id: number,
  name: string,
  price: number,
  quantity: number,
  total: number
}

export interface Order {
  orderId: string,
  totalPrice: number,
  bonus: number,
  products: MatTableDataSource<StrippedProduct>,
  delivered: boolean
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  public tableColumns = ['product', 'price', 'quantity', 'total price', 'review']
  public orders: Order[] = []
  public emptyState: boolean = true

  constructor (private router: Router, private dialog: MatDialog, private orderHistoryService: OrderHistoryService, private basketService: BasketService, private productService: ProductService) { }

  ngOnInit () {
    this.orderHistoryService.get().subscribe((orders) => {
      orders = orders.reverse()
      if (orders.length === 0) {
        this.emptyState = true
      } else {
        this.emptyState = false
      }
      for (const order of orders) {
        const products: StrippedProduct[] = []
        for (const product of order.products) {
          products.push({
            id: product.id,
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
          products: new MatTableDataSource<StrippedProduct>(products),
          delivered: order.delivered
        })
      }
    },(err) => console.log(err))
  }

  showDetail (id: number) {
    this.productService.get(id).subscribe((product) => {
      const element: Product = {
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price,
        points: Math.round(product.price / 10)
      }
      this.dialog.open(ProductDetailsComponent, {
        width: '500px',
        height: 'max-content',
        data: {
          productData: element
        }
      })
    },(err) => console.log(err))
  }

  openConfirmationPDF (orderId) {
    const redirectUrl = this.basketService.hostServer + '/ftp/order_' + orderId + '.pdf'
    window.open(redirectUrl,'_blank')
  }

  trackOrder (orderId) {
    this.router.navigate(['/track-result'], {
      queryParams: {
        id: orderId
      }
    })
  }
}
