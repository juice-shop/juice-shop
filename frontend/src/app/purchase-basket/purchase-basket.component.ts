/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, EventEmitter, Input, type OnInit, Output } from '@angular/core'
import { BasketService } from '../Services/basket.service'
import { UserService } from '../Services/user.service'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons/'
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons'
import { DeluxeGuard } from '../app.guard'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconButton } from '@angular/material/button'

import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow } from '@angular/material/table'

library.add(faTrashAlt, faMinusSquare, faPlusSquare)

@Component({
  selector: 'app-purchase-basket',
  templateUrl: './purchase-basket.component.html',
  styleUrls: ['./purchase-basket.component.scss'],
  imports: [MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatIconButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow, TranslateModule]
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

  ngOnInit (): void {
    if (this.allowEdit && !this.tableColumns.includes('remove')) {
      this.tableColumns.push('remove')
    }
    this.load()
    this.userService.whoAmI().subscribe({
      next: (data) => {
        this.userEmail = data.email || 'anonymous'
        this.userEmail = '(' + this.userEmail + ')'
      },
      error: (err) => { console.log(err) }
    })
  }

  load () {
    this.basketService.find(parseInt(sessionStorage.getItem('bid'), 10)).subscribe({
      next: (basket) => {
        if (this.isDeluxe()) {
          basket.Products.forEach(product => {
            product.price = product.deluxePrice
          })
        }
        this.dataSource = basket.Products
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        this.itemTotal = basket.Products.reduce((itemTotal, product) => itemTotal + product.price * product.BasketItem.quantity, 0)
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        this.bonus = basket.Products.reduce((bonusPoints, product) => bonusPoints + Math.round(product.price / 10) * product.BasketItem.quantity, 0)
        this.sendToParent(this.dataSource.length)
      },
      error: (err) => { console.log(err) }
    })
  }

  delete (id) {
    this.basketService.del(id).subscribe({
      next: () => {
        this.load()
        this.basketService.updateNumberOfCartItems()
      },
      error: (err) => { console.log(err) }
    })
  }

  inc (id) {
    this.addToQuantity(id, 1)
  }

  dec (id) {
    this.addToQuantity(id, -1)
  }

  addToQuantity (id, value) {
    this.basketService.get(id).subscribe({
      next: (basketItem) => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const newQuantity = basketItem.quantity + value
        this.basketService.put(id, { quantity: newQuantity < 1 ? 1 : newQuantity }).subscribe({
          next: () => {
            this.load()
            this.basketService.updateNumberOfCartItems()
          },
          error: (err) => {
            this.snackBarHelperService.open(err.error?.error, 'errorBar')
            console.log(err)
          }
        })
      },
      error: (err) => { console.log(err) }
    })
  }

  sendToParent (count) {
    this.emitTotal.emit([this.itemTotal, this.bonus])
    this.emitProductCount.emit(count)
  }

  isDeluxe () {
    return this.deluxeGuard.isDeluxe()
  }
}
