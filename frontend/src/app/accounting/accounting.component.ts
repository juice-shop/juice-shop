/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ProductService } from '../Services/product.service'
import { type AfterViewInit, Component, type OnDestroy, ViewChild, inject } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { type Subscription } from 'rxjs'
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table'
import { QuantityService } from '../Services/quantity.service'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { OrderHistoryService } from '../Services/order-history.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatSuffix } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { MatIconButton } from '@angular/material/button'

import { TranslateModule } from '@ngx-translate/core'
import { MatCardModule } from '@angular/material/card'

library.add(faCheck)

interface Order {
  id: string
  orderId: string
  totalPrice: number
  delivered: boolean
}

@Component({
  selector: 'app-accounting',
  templateUrl: './accounting.component.html',
  styleUrls: ['./accounting.component.scss'],
  imports: [MatCardModule, TranslateModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIconButton, MatTooltip, MatIconModule, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, MatFormFieldModule, MatInputModule, MatSuffix]
})
export class AccountingComponent implements AfterViewInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly quantityService = inject(QuantityService);
  private readonly orderHistoryService = inject(OrderHistoryService);
  private readonly snackBarHelperService = inject(SnackBarHelperService);

  public orderHistoryColumns = ['OrderId', 'Price', 'Status', 'StatusButton']
  @ViewChild('paginatorOrderHistory', { static: true }) paginatorOrderHistory: MatPaginator
  public orderData: Order[]
  public orderSource
  public displayedColumns = ['Product', 'Price', 'Quantity']
  public tableData: any[]
  public dataSource
  @ViewChild('paginator', { static: true }) paginator: MatPaginator
  private productSubscription: Subscription
  private quantitySubscription: Subscription
  public quantityMap: any

  ngAfterViewInit () {
    this.loadQuantity()
    this.loadProducts()
    this.loadOrders()
  }

  loadQuantity () {
    this.quantitySubscription = this.quantityService.getAll().subscribe({
      next: (stock) => {
        this.quantityMap = {}
        stock.forEach((item) => {
          this.quantityMap[item.ProductId] = {
            id: item.id,
            quantity: item.quantity
          }
        })
      },
      error: (err) => { console.log(err) }
    })
  }

  loadProducts () {
    this.productSubscription = this.productService.search('').subscribe({
      next: (tableData: any) => {
        this.tableData = tableData
        this.dataSource = new MatTableDataSource<Element>(this.tableData)
        this.dataSource.paginator = this.paginator
      },
      error: (err) => { console.log(err) }
    })
  }

  loadOrders () {
    this.orderHistoryService.getAll().subscribe({
      next: (orders) => {
        this.orderData = []
        for (const order of orders) {
          this.orderData.push({
            id: order._id,
            orderId: order.orderId,
            totalPrice: order.totalPrice,
            delivered: order.delivered
          })
        }
        this.orderSource = new MatTableDataSource<Order>(this.orderData)
        this.orderSource.paginator = this.paginatorOrderHistory
      },
      error: (err) => { console.log(err) }
    })
  }

  ngOnDestroy () {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe()
    }
    if (this.quantitySubscription) {
      this.quantitySubscription.unsubscribe()
    }
  }

  modifyQuantity (id, value) {
    this.quantityService.put(id, { quantity: value < 0 ? 0 : value }).subscribe({
      next: (quantity) => {
        const product = this.tableData.find((product) => {
          return product.id === quantity.ProductId
        })

        this.snackBarHelperService.open(`Quantity for ${product.name} has been updated.`, 'confirmBar')
        this.loadQuantity()
      },
      error: (err) => {
        this.snackBarHelperService.open(err.error, 'errorBar')
        console.log(err)
      }
    })
  }

  modifyPrice (id, value) {
    this.productService.put(id, { price: value < 0 ? 0 : value }).subscribe({
      next: (product) => {

        this.snackBarHelperService.open(`Price for ${product.name} has been updated.`, 'confirmBar')
        this.loadProducts()
      },
      error: (err) => {
        this.snackBarHelperService.open(err.error, 'errorBar')
        console.log(err)
      }
    })
  }

  changeDeliveryStatus (deliveryStatus, orderId) {
    this.orderHistoryService.toggleDeliveryStatus(orderId, { deliveryStatus }).subscribe({
      next: () => {
        this.loadOrders()
      },
      error: (err) => {
        this.snackBarHelperService.open(err, 'errorBar')
        console.log(err)
      }
    })
  }
}
