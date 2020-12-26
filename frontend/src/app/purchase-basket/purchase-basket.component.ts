/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { BasketService } from '../Services/basket.service'
import { UserService } from '../Services/user.service'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons/'
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons'
import { DeluxeGuard } from '../app.guard'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

library.add(faTrashAlt, faMinusSquare, faPlusSquare)
dom.watch()

@Component({
  selector: 'app-purchase-basket',
  templateUrl: './purchase-basket.component.html',
  styleUrls: ['./purchase-basket.component.scss']
})
export class PurchaseBasketComponent implements OnInit {
  @Input('allowEdit') public allowEdit: boolean = false
  @Input('displayTotal') public displayTotal: boolean = false
  @Input('totalPrice') public totalPrice: boolean = true
  @Output() emitTotal = new EventEmitter()
  @Output() emitProductCount = new EventEmitter()
  public tableColumns = ['image', 'product', 'quantity', 'price']
  public dataSource = []
  public bonus = 0
  public itemTotal = 0
  public userEmail: string
  constructor (private readonly deluxeGuard: DeluxeGuard, private readonly basketService: BasketService,
    private readonly userService: UserService, private readonly snackBarHelperService: SnackBarHelperService) { }

  ngOnInit () {
    if (this.allowEdit && !this.tableColumns.includes('remove')) {
      this.tableColumns.push('remove')
    }
    this.load()
    this.userService.whoAmI().subscribe((data) => {
      this.userEmail = data.email || 'anonymous'
      this.userEmail = '(' + this.userEmail + ')'
    }, (err) => console.log(err))
  }

  load () {
    this.basketService.find(parseInt(sessionStorage.getItem('bid'), 10)).subscribe((basket) => {
      if (this.isDeluxe()) {
        basket.Products.map(product => {
          product.price = product.deluxePrice
        })
      }
      this.dataSource = basket.Products
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      this.itemTotal = basket.Products.reduce((itemTotal, product) => itemTotal + product.price * product.BasketItem.quantity, 0)
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      this.bonus = basket.Products.reduce((bonusPoints, product) => bonusPoints + Math.round(product.price / 10) * product.BasketItem.quantity, 0)
      this.sendToParent(this.dataSource.length)
    }, (err) => console.log(err))
  }

  delete (id) {
    this.basketService.del(id).subscribe(() => {
      this.load()
      this.basketService.updateNumberOfCartItems()
    }, (err) => console.log(err))
  }

  inc (id) {
    this.addToQuantity(id, 1)
  }

  dec (id) {
    this.addToQuantity(id, -1)
  }

  addToQuantity (id, value) {
    this.basketService.get(id).subscribe((basketItem) => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      const newQuantity = basketItem.quantity + value
      this.basketService.put(id, { quantity: newQuantity < 1 ? 1 : newQuantity }).subscribe(() => {
        this.load()
        this.basketService.updateNumberOfCartItems()
      }, (err) => {
        this.snackBarHelperService.open(err.error?.error, 'errorBar')
        console.log(err)
      })
    }, (err) => console.log(err))
  }

  sendToParent (count) {
    this.emitTotal.emit([this.itemTotal, this.bonus])
    this.emitProductCount.emit(count)
  }

  isDeluxe () {
    return this.deluxeGuard.isDeluxe()
  }
}
