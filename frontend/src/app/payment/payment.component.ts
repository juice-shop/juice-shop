import { FormControl, Validators } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { BasketService } from '../Services/basket.service'
import { TranslateService } from '@ngx-translate/core'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import {
  faCartArrowDown,
  faCreditCard,
  faGift,
  faHeart,
  faThumbsUp,
  faTshirt,
  faStickyNote,
  faHandHoldingUsd,
  faCoffee,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import { faCreditCard as faCredit } from '@fortawesome/free-regular-svg-icons/'
import { faBtc, faEthereum, faPaypal, faLeanpub, faPatreon } from '@fortawesome/free-brands-svg-icons'
import { QrCodeComponent } from '../qr-code/qr-code.component'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'

library.add(faCartArrowDown, faGift, faCreditCard, faHeart, faBtc, faPaypal, faLeanpub, faEthereum, faCredit, faThumbsUp, faTshirt, faStickyNote, faHandHoldingUsd, faCoffee, faPatreon, faTimes)
dom.watch()

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  public couponConfirmation: any
  public couponError: any
  public card: any = {}
  public twitterUrl = null
  public facebookUrl = null
  public applicationName = 'OWASP Juice Shop'
  private campaignCoupon: string
  public couponControl: FormControl = new FormControl('',[Validators.required, Validators.minLength(10), Validators.maxLength(10)])
  public clientDate: any
  public paymentId: any = undefined
  public couponPanelExpanded: boolean = false
  public paymentPanelExpanded: boolean = false
  public allowContinue: boolean = false

  constructor (private router: Router, private dialog: MatDialog, private configurationService: ConfigurationService, private basketService: BasketService, private translate: TranslateService) { }

  ngOnInit () {
    this.couponPanelExpanded = localStorage.getItem('couponPanelExpanded') ? JSON.parse(localStorage.getItem('couponPanelExpanded')) : false
    this.paymentPanelExpanded = localStorage.getItem('paymentPanelExpanded') ? JSON.parse(localStorage.getItem('paymentPanelExpanded')) : false

    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.application) {
        if (config.application.twitterUrl !== null) {
          this.twitterUrl = config.application.twitterUrl
        }
        if (config.application.facebookUrl !== null) {
          this.facebookUrl = config.application.facebookUrl
        }
        if (config.application.name !== null) {
          this.applicationName = config.application.name
        }
      }
    },(err) => console.log(err))
  }

  applyCoupon () {
    this.campaignCoupon = this.couponControl.value
    this.clientDate = new Date()
    this.clientDate.setHours(0,0,0,0)
    this.clientDate = this.clientDate.getTime()
    sessionStorage.setItem('couponDetails', this.campaignCoupon + '-' + this.clientDate)
    if (this.couponControl.value === 'WMNSDY2019') { // TODO Use internal code table or retrieve from AWS Lambda instead
      if (this.clientDate === new Date('Mar 08, 2019').getTime()) { // = Mar 08, 2019
        this.showConfirmation(75)
      } else {
        this.couponConfirmation = undefined
        this.couponError = { error: 'Invalid Coupon.' } // FIXME i18n error message
        this.resetCouponForm()
      }
    } else {
      this.basketService.applyCoupon(Number(sessionStorage.getItem('bid')), encodeURIComponent(this.couponControl.value)).subscribe((discount: any) => {
        this.showConfirmation(discount)
      },(err) => {
        this.couponConfirmation = undefined
        this.couponError = err
        this.resetCouponForm()
      })
    }
  }

  showConfirmation (discount) {
    this.resetCouponForm()
    this.couponError = undefined
    sessionStorage.setItem('couponDiscount', discount)
    this.translate.get('DISCOUNT_APPLIED', { discount }).subscribe((discountApplied) => {
      this.couponConfirmation = discountApplied
    }, (translationId) => {
      this.couponConfirmation = translationId
    })
  }

  getMessage (id) {
    this.paymentId = id
  }

  choosePayment () {
    sessionStorage.setItem('paymentId', this.paymentId)
    this.router.navigate(['/order-summary'])
  }

  showBitcoinQrCode () {
    this.dialog.open(QrCodeComponent, {
      data: {
        data: 'bitcoin:1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        url: '/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        address: '1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        title: 'TITLE_BITCOIN_ADDRESS'
      }
    })
  }

  showDashQrCode () {
    this.dialog.open(QrCodeComponent, {
      data: {
        data: 'dash:Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        url: '/redirect?to=https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        address: 'Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        title: 'TITLE_DASH_ADDRESS'
      }
    })
  }

  showEtherQrCode () {
    this.dialog.open(QrCodeComponent, {
      data: {
        data: '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6',
        url: '/redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6',
        address: '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6',
        title: 'TITLE_ETHER_ADDRESS'
      }
    })
  }

  resetCouponForm () {
    this.couponControl.setValue('')
    this.couponControl.markAsPristine()
    this.couponControl.markAsUntouched()
  }
}
