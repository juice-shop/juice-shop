/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, inject } from '@angular/core'
import { TrackOrderService } from '../Services/track-order.service'
import { ActivatedRoute, type ParamMap, RouterLink } from '@angular/router'
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow } from '@angular/material/table'
import { BasketService } from '../Services/basket.service'
import { AddressService } from '../Services/address.service'
import { ConfigurationService } from '../Services/configuration.service'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { MatIconButton } from '@angular/material/button'

import { TranslateModule } from '@ngx-translate/core'

import { MatCardModule } from '@angular/material/card'

library.add(faTwitter)

@Component({
  selector: 'app-order-completion',
  templateUrl: './order-completion.component.html',
  styleUrls: ['./order-completion.component.scss'],
  imports: [MatCardModule, TranslateModule, RouterLink, MatIconButton, MatTooltip, MatIconModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow]
})
export class OrderCompletionComponent implements OnInit {
  private readonly configurationService = inject(ConfigurationService);
  private readonly addressService = inject(AddressService);
  private readonly trackOrderService = inject(TrackOrderService);
  activatedRoute = inject(ActivatedRoute);
  private readonly basketService = inject(BasketService);

  public tableColumns = ['product', 'price', 'quantity', 'total price']
  public dataSource
  public orderId: string
  public orderDetails: any = { totalPrice: 0 }
  public deliveryPrice = 0
  public promotionalDiscount = 0
  public address: any
  public tweetText = 'I just purchased'

  ngOnInit (): void {
    this.activatedRoute.paramMap.subscribe({
      next: (paramMap: ParamMap) => {
        this.orderId = paramMap.get('id')
        this.trackOrderService.find(this.orderId).subscribe({
          next: (results) => {
            this.promotionalDiscount = results.data[0].promotionalAmount ? parseFloat(results.data[0].promotionalAmount) : 0
            this.deliveryPrice = results.data[0].deliveryPrice ? parseFloat(results.data[0].deliveryPrice) : 0
            this.orderDetails.addressId = results.data[0].addressId
            this.orderDetails.paymentId = results.data[0].paymentId
            this.orderDetails.totalPrice = results.data[0].totalPrice

            this.orderDetails.itemTotal = results.data[0].totalPrice + this.promotionalDiscount - this.deliveryPrice
            this.orderDetails.eta = results.data[0].eta || '?'
            this.orderDetails.products = results.data[0].products
            this.orderDetails.bonus = results.data[0].bonus
            this.dataSource = new MatTableDataSource<Element>(this.orderDetails.products)
            for (const product of this.orderDetails.products) {

              this.tweetText += `%0a- ${product.name}`
            }
            this.tweetText = this.truncateTweet(this.tweetText)
            this.configurationService.getApplicationConfiguration().subscribe({
              next: (config) => {
                if (config?.application?.social) {
                  this.tweetText += '%0afrom '
                  if (config.application.social.twitterUrl) {
                    this.tweetText += config.application.social.twitterUrl.replace('https://twitter.com/', '@')
                  } else {
                    this.tweetText += config.application.name
                  }
                }
              },
              error: (err) => { console.log(err) }
            })
            this.addressService.getById(this.orderDetails.addressId).subscribe({
              next: (address) => {
                this.address = address
              },
              error: (error) => { console.log(error) }
            })
          },
          error: (err) => { console.log(err) }
        })
      },
      error: (err) => { console.log(err) }
    })
  }

  openConfirmationPDF () {
    const redirectUrl = `${this.basketService.hostServer}/ftp/order_${this.orderId}.pdf`
    window.open(redirectUrl, '_blank')
  }

  truncateTweet = (tweet: string, maxLength = 140) => {
    if (!tweet) return null
    const showDots = tweet.length > maxLength
    return `${tweet.substring(0, maxLength)}${showDots ? '...' : ''}`
  }
}
