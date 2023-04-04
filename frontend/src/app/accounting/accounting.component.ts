/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ProductService } from '../Services/product.service'
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { Subscription } from 'rxjs'
import { MatTableDataSource } from '@angular/material/table'
import { QuantityService } from '../Services/quantity.service'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { OrderHistoryService } from '../Services/order-history.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

library.add(faCheck)
dom.watch()

interface Order {
  id: string
  orderId: string
  totalPrice: number
  delivered: boolean
}

@Component({
  selector: 'app-accounting',
  templateUrl: './accounting.component.html',
  styleUrls: ['./accounting.component.scss']
  })
export class AccountingComponent implements AfterViewInit, OnDestroy {
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
  constructor (private readonly productService: ProductService, private readonly quantityService: QuantityService, private readonly orderHistoryService: OrderHistoryService, private readonly snackBarHelperService: SnackBarHelperService) { }

  ngAfterViewInit () {
    this.loadQuantity()
    this.loadProducts()
    this.loadOrders()
  }

  loadQuantity () {
    this.quantitySubscription = this.quantityService.getAll().subscribe((stock) => {
      this.quantityMap = {}
      stock.forEach((item) => {
        this.quantityMap[item.ProductId] = {
          id: item.id,
          quantity: item.quantity
        }
      })
    }, (err) => console.log(err))
  }

  loadProducts () {
    this.productSubscription = this.productService.search('').subscribe((tableData: any) => {
      this.tableData = tableData
      this.dataSource = new MatTableDataSource<Element>(this.tableData)
      this.dataSource.paginator = this.paginator
    }, (err) => console.log(err))
  }

  loadOrders () {
    this.orderHistoryService.getAll().subscribe((orders) => {
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
    }, (err) => console.log(err))
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
    this.quantityService.put(id, { quantity: value < 0 ? 0 : value }).subscribe((quantity) => {
      const product = this.tableData.find((product) => {
        return product.id === quantity.ProductId
      })
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.snackBarHelperService.open(`Quantity for ${product.name} has been updated.`, 'confirmBar')
      this.loadQuantity()
    }, (err) => {
      this.snackBarHelperService.open(err.error, 'errorBar')
      console.log(err)
    })
  }

  modifyPrice (id, value) {
    this.productService.put(id, { price: value < 0 ? 0 : value }).subscribe((product) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.snackBarHelperService.open(`Price for ${product.name} has been updated.`, 'confirmBar')
      this.loadProducts()
    }, (err) => {
      this.snackBarHelperService.open(err.error, 'errorBar')
      console.log(err)
    })
  }

  changeDeliveryStatus (deliveryStatus, orderId) {
    this.orderHistoryService.toggleDeliveryStatus(orderId, { deliveryStatus: deliveryStatus }).subscribe(() => {
      this.loadOrders()
    }, (err) => {
      this.snackBarHelperService.open(err, 'errorBar')
      console.log(err)
    })
  }
}
