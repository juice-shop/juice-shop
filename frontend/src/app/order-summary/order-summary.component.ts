/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, OnInit } from '@angular/core'
import { AddressService } from '../Services/address.service'
import { PaymentService } from '../Services/payment.service'
import { BasketService } from '../Services/basket.service'
import { Router } from '@angular/router'
import { DeliveryService } from '../Services/delivery.service'

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
  public address: any
  public paymentMethod: any
  constructor (private router: Router, private addressService: AddressService, private paymentService: PaymentService, private basketService: BasketService, private deliveryService: DeliveryService, private ngZone: NgZone) { }

  ngOnInit () {
    this.deliveryService.getById(sessionStorage.getItem('deliveryMethodId')).subscribe((method) => {
      this.deliveryPrice = method.price
    })

    this.addressService.getById(sessionStorage.getItem('addressId')).subscribe((address) => {
      this.address = address
    }, (error) => console.log(error))

    if (sessionStorage.getItem('paymentId') !== 'wallet') {
      this.paymentService.getById(sessionStorage.getItem('paymentId')).subscribe((card) => {
        card.cardNum = String(card.cardNum).substring(String(card.cardNum).length - 4)
        this.paymentMethod = card
      }, (err) => console.log(err))
    } else if (sessionStorage.getItem('paymentId') === 'wallet') {
      this.paymentMethod = 'wallet'
    }
  }

  getMessage (total) {
    this.itemTotal = total[0]
    this.promotionalDiscount = sessionStorage.getItem('couponDiscount') ? (parseFloat(sessionStorage.getItem('couponDiscount')) / 100) * this.itemTotal : 0
    this.bonus = total[1]
  }

  placeOrder () {
    const orderDetails = {
      paymentId: sessionStorage.getItem('paymentId'),
      addressId: sessionStorage.getItem('addressId'),
      deliveryMethodId: sessionStorage.getItem('deliveryMethodId')
    }
    this.basketService.checkout(Number(sessionStorage.getItem('bid')), btoa(sessionStorage.getItem('couponDetails')), orderDetails).subscribe((orderConfirmationId) => {
      sessionStorage.removeItem('paymentId')
      sessionStorage.removeItem('addressId')
      sessionStorage.removeItem('deliveryMethodId')
      sessionStorage.removeItem('couponDetails')
      sessionStorage.removeItem('couponDiscount')
      this.basketService.updateNumberOfCardItems()
      this.ngZone.run(() => this.router.navigate(['/order-completion', orderConfirmationId]))
    }, (err) => console.log(err))
  }
}
