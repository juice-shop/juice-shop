/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Component, OnInit } from '@angular/core'
import { TrackOrderService } from '../Services/track-order.service'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { MatTableDataSource } from '@angular/material/table'
import { BasketService } from '../Services/basket.service'
import { AddressService } from '../Services/address.service'
import { ConfigurationService } from '../Services/configuration.service'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

library.add(faTwitter)
dom.watch()

@Component({
  selector: 'app-order-completion',
  templateUrl: './order-completion.component.html',
  styleUrls: ['./order-completion.component.scss']
})
export class OrderCompletionComponent implements OnInit {
  public tableColumns = ['product', 'price', 'quantity', 'total price']
  public dataSource
  public orderId
  public orderDetails: any = { totalPrice: 0 }
  public deliveryPrice = 0
  public promotionalDiscount = 0
  public address: any
  public tweetText: string = 'I just purchased'

  constructor (private readonly configurationService: ConfigurationService, private readonly addressService: AddressService, private readonly trackOrderService: TrackOrderService, public activatedRoute: ActivatedRoute, private readonly basketService: BasketService) { }

  ngOnInit () {
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      this.orderId = paramMap.get('id')
      this.trackOrderService.save(this.orderId).subscribe((results) => {
        this.promotionalDiscount = results.data[0].promotionalAmount ? parseFloat(results.data[0].promotionalAmount) : 0
        this.deliveryPrice = results.data[0].deliveryPrice ? parseFloat(results.data[0].deliveryPrice) : 0
        this.orderDetails.addressId = results.data[0].addressId
        this.orderDetails.paymentId = results.data[0].paymentId
        this.orderDetails.totalPrice = results.data[0].totalPrice
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        this.orderDetails.itemTotal = results.data[0].totalPrice + this.promotionalDiscount - this.deliveryPrice
        this.orderDetails.eta = results.data[0].eta || '?'
        this.orderDetails.products = results.data[0].products
        this.orderDetails.bonus = results.data[0].bonus
        this.dataSource = new MatTableDataSource<Element>(this.orderDetails.products)
        for (const product of this.orderDetails.products) {
          this.tweetText += `%0a- ${product.name}`
        }
        this.tweetText = this.truncateTweet(this.tweetText)
        this.configurationService.getApplicationConfiguration().subscribe((config) => {
          if (config && config.application && config.application.social) {
            this.tweetText += '%0afrom '
            if (config.application.social.twitterUrl) {
              this.tweetText += config.application.social.twitterUrl.replace('https://twitter.com/', '@')
            } else {
              this.tweetText += config.application.name
            }
          }
        }, (err) => console.log(err))
        this.addressService.getById(this.orderDetails.addressId).subscribe((address) => {
          this.address = address
        }, (error) => console.log(error))
      }, (err) => console.log(err))
    }, (err) => console.log(err))
  }

  openConfirmationPDF () {
    const redirectUrl = `${this.basketService.hostServer}/ftp/order_${this.orderId}.pdf`
    window.open(redirectUrl, '_blank')
  }

  truncateTweet = (tweet, maxLength = 140) => {
    if (!tweet) return null
    const showDots = tweet.length > maxLength
    return `${tweet.substring(0, maxLength)}${showDots ? '...' : ''}`
  }
}
