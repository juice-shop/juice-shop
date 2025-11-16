/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Component, NgZone, type OnInit, inject } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { BasketService } from '../Services/basket.service'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCartArrowDown,
  faCoffee,
  faGift,
  faHandHoldingUsd,
  faHeart,
  faStickyNote,
  faThumbsUp,
  faTimes,
  faTshirt,
  faPalette
} from '@fortawesome/free-solid-svg-icons'
import { faLeanpub, faStripe } from '@fortawesome/free-brands-svg-icons'
import { QrCodeComponent } from '../qr-code/qr-code.component'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, type ParamMap, Router } from '@angular/router'
import { WalletService } from '../Services/wallet.service'
import { DeliveryService } from '../Services/delivery.service'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngy-cookie'
import { Location } from '@angular/common'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatHint, MatError } from '@angular/material/form-field'
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion'
import { MatButtonModule } from '@angular/material/button'

import { MatDivider } from '@angular/material/divider'
import { PaymentMethodComponent } from '../payment-method/payment-method.component'
import { MatCardModule } from '@angular/material/card'

library.add(faCartArrowDown, faGift, faHeart, faLeanpub, faThumbsUp, faTshirt, faStickyNote, faHandHoldingUsd, faCoffee, faTimes, faStripe, faPalette)

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  imports: [MatCardModule, PaymentMethodComponent, MatDivider, TranslateModule, MatButtonModule, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatFormFieldModule, MatLabel, MatHint, MatInputModule, FormsModule, ReactiveFormsModule, MatError, MatIconModule]
})
export class PaymentComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly cookieService = inject(CookieService);
  private readonly userService = inject(UserService);
  private readonly deliveryService = inject(DeliveryService);
  private readonly walletService = inject(WalletService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly configurationService = inject(ConfigurationService);
  private readonly basketService = inject(BasketService);
  private readonly translate = inject(TranslateService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly ngZone = inject(NgZone);
  private readonly snackBarHelperService = inject(SnackBarHelperService);

  public couponConfirmation: any
  public couponError: any
  public card: any = {}
  public blueSkyUrl = null
  public redditUrl = null
  public applicationName = 'OWASP Juice Shop'
  private campaignCoupon: string
  public couponControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)])
  public clientDate: any
  public paymentId: any = undefined
  public couponPanelExpanded = false
  public paymentPanelExpanded = false
  public mode: any
  public walletBalance = 0
  public walletBalanceStr: string
  public totalPrice: any = 0
  public paymentMode = 'card'
  private readonly campaigns = {
    WMNSDY2019: { validOn: 1551999600000, discount: 75 },
    WMNSDY2020: { validOn: 1583622000000, discount: 60 },
    WMNSDY2021: { validOn: 1615158000000, discount: 60 },
    WMNSDY2022: { validOn: 1646694000000, discount: 60 },
    WMNSDY2023: { validOn: 1678230000000, discount: 60 },
    ORANGE2020: { validOn: 1588546800000, discount: 50 },
    ORANGE2021: { validOn: 1620082800000, discount: 40 },
    ORANGE2022: { validOn: 1651618800000, discount: 40 },
    ORANGE2023: { validOn: 1683154800000, discount: 40 }
  }

  ngOnInit (): void {
    this.initTotal()
    this.walletService.get().subscribe({
      next: (balance) => {
        this.walletBalance = balance
        this.walletBalanceStr = parseFloat(balance).toFixed(2)
      },
      error: (err) => { console.log(err) }
    })
    this.couponPanelExpanded = localStorage.getItem('couponPanelExpanded') ? JSON.parse(localStorage.getItem('couponPanelExpanded')) : false
    this.paymentPanelExpanded = localStorage.getItem('paymentPanelExpanded') ? JSON.parse(localStorage.getItem('paymentPanelExpanded')) : false

    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config) => {
        if (config?.application?.social) {
          if (config.application.social.blueSkyUrl) {
            this.blueSkyUrl = config.application.social.blueSkyUrl
          }
          if (config.application.social.redditUrl) {
            this.redditUrl = config.application.social.redditUrl
          }
          if (config.application.name) {
            this.applicationName = config.application.name
          }
        }
      },
      error: (err) => { console.log(err) }
    })
  }

  initTotal () {
    this.activatedRoute.paramMap.subscribe({
      next: (paramMap: ParamMap) => {
        this.mode = paramMap.get('entity')
        if (this.mode === 'wallet') {
          this.totalPrice = parseFloat(sessionStorage.getItem('walletTotal'))
        } else if (this.mode === 'deluxe') {
          this.userService.deluxeStatus().subscribe({
            next: (res) => {
              this.totalPrice = res.membershipCost
            },
            error: (err) => { console.log(err) }
          })
        } else {
          const itemTotal = parseFloat(sessionStorage.getItem('itemTotal'))
          const promotionalDiscount = sessionStorage.getItem('couponDiscount') ? (parseFloat(sessionStorage.getItem('couponDiscount')) / 100) * itemTotal : 0
          this.deliveryService.getById(sessionStorage.getItem('deliveryMethodId')).subscribe((method) => {
            const deliveryPrice = method.price
            this.totalPrice = itemTotal + deliveryPrice - promotionalDiscount
          })
        }
      },
      error: (err) => { console.log(err) }
    })
  }

  applyCoupon () {
    this.campaignCoupon = this.couponControl.value
    this.clientDate = new Date()

    const offsetTimeZone = (this.clientDate.getTimezoneOffset() + 60) * 60 * 1000
    this.clientDate.setHours(0, 0, 0, 0)
    this.clientDate = this.clientDate.getTime() - offsetTimeZone

    sessionStorage.setItem('couponDetails', `${this.campaignCoupon}-${this.clientDate}`)
    const campaign = this.campaigns[this.couponControl.value]
    if (campaign) {
      if (this.clientDate === campaign.validOn) {
        this.showConfirmation(campaign.discount)
      } else {
        this.couponConfirmation = undefined
        this.translate.get('INVALID_COUPON').subscribe({
          next: (invalidCoupon) => {
            this.couponError = { error: invalidCoupon }
          },
          error: (translationId) => {
            this.couponError = { error: translationId }
          }
        })
        this.resetCouponForm()
      }
    } else {
      this.basketService.applyCoupon(Number(sessionStorage.getItem('bid')), encodeURIComponent(this.couponControl.value)).subscribe({
        next: (discount: any) => {
          this.showConfirmation(discount)
        },
        error: (err) => {
          this.couponConfirmation = undefined
          this.couponError = err
          this.resetCouponForm()
        }
      })
    }
  }

  showConfirmation (discount) {
    this.resetCouponForm()
    this.couponError = undefined
    sessionStorage.setItem('couponDiscount', discount)
    this.translate.get('DISCOUNT_APPLIED', { discount }).subscribe({
      next: (discountApplied) => {
        this.couponConfirmation = discountApplied
      },
      error: (translationId) => {
        this.couponConfirmation = translationId
      }
    })
    this.initTotal()
  }

  getMessage (id) {
    this.paymentId = id
    this.paymentMode = 'card'
  }

  routeToPreviousUrl () {
    this.location.back()
  }

  choosePayment () {
    sessionStorage.removeItem('itemTotal')
    if (this.mode === 'wallet') {
      this.walletService.put({ balance: this.totalPrice, paymentId: this.paymentId }).subscribe({
        next: () => {
          sessionStorage.removeItem('walletTotal')
          this.ngZone.run(async () => await this.router.navigate(['/wallet']))
          this.snackBarHelperService.open('CHARGED_WALLET', 'confirmBar')
        },
        error: (err) => {
          console.log(err)
          this.snackBarHelperService.open(err.error?.message, 'errorBar')
        }
      })
    } else if (this.mode === 'deluxe') {
      this.userService.upgradeToDeluxe(this.paymentMode, this.paymentId).subscribe({
        next: (data) => {
          localStorage.setItem('token', data.token)
          this.cookieService.put('token', data.token)
          this.ngZone.run(async () => await this.router.navigate(['/deluxe-membership']))
        },
        error: (err) => { console.log(err) }
      })
    } else {
      if (this.paymentMode === 'wallet') {
        if (this.walletBalance < this.totalPrice) {
          this.snackBarHelperService.open('INSUFFICIENT_WALLET_BALANCE', 'errorBar')
          return
        }
        sessionStorage.setItem('paymentId', 'wallet')
      } else {
        sessionStorage.setItem('paymentId', this.paymentId)
      }
      this.ngZone.run(async () => await this.router.navigate(['/order-summary']))
    }
  }


  noop () { }

  showBitcoinQrCode () {
    this.dialog.open(QrCodeComponent, {
      data: {
        data: 'bitcoin:1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        url: './redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        address: '1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        title: 'TITLE_BITCOIN_ADDRESS'
      }
    })
  }

  showDashQrCode () {
    this.dialog.open(QrCodeComponent, {
      data: {
        data: 'dash:Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        url: './redirect?to=https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        address: 'Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        title: 'TITLE_DASH_ADDRESS'
      }
    })
  }

  showEtherQrCode () {
    this.dialog.open(QrCodeComponent, {
      data: {
        data: '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6',
        url: './redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6',
        address: '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6',
        title: 'TITLE_ETHER_ADDRESS'
      }
    })
  }

  useWallet () {
    this.paymentMode = 'wallet'
    this.choosePayment()
  }

  resetCouponForm () {
    this.couponControl.setValue('')
    this.couponControl.markAsPristine()
    this.couponControl.markAsUntouched()
  }
}
