import { FormControl, Validators } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { BasketService } from '../Services/basket.service'
import { TranslateService } from '@ngx-translate/core'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import {
  faCartArrowDown,
  faCoffee,
  faCreditCard,
  faGift,
  faHandHoldingUsd,
  faHeart,
  faStickyNote,
  faThumbsUp,
  faTimes,
  faTshirt
} from '@fortawesome/free-solid-svg-icons'
import { faCreditCard as faCredit } from '@fortawesome/free-regular-svg-icons/'
import { faBtc, faEthereum, faLeanpub, faPatreon, faPaypal } from '@fortawesome/free-brands-svg-icons'
import { QrCodeComponent } from '../qr-code/qr-code.component'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { WalletService } from '../Services/wallet.service'
import { DeliveryService } from '../Services/delivery.service'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngx-cookie'

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
  public mode: any
  public walletBalance: number = 0
  public walletBalanceStr: string
  public totalPrice: any = 0
  public payUsingWallet: boolean = false
  private campaigns = {
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

  constructor (private cookieService: CookieService, private userService: UserService, private deliveryService: DeliveryService, private walletService: WalletService, private router: Router, private dialog: MatDialog, private configurationService: ConfigurationService, private basketService: BasketService, private translate: TranslateService, private activatedRoute: ActivatedRoute) { }

  ngOnInit () {
    this.initTotal()
    this.walletService.get().subscribe((balance) => {
      this.walletBalance = balance
      this.walletBalanceStr = parseFloat(balance).toFixed(2)
    },(err) => console.log(err))
    this.couponPanelExpanded = localStorage.getItem('couponPanelExpanded') ? JSON.parse(localStorage.getItem('couponPanelExpanded')) : false
    this.paymentPanelExpanded = localStorage.getItem('paymentPanelExpanded') ? JSON.parse(localStorage.getItem('paymentPanelExpanded')) : false

    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.application) {
        if (config.application.twitterUrl) {
          this.twitterUrl = config.application.twitterUrl
        }
        if (config.application.facebookUrl) {
          this.facebookUrl = config.application.facebookUrl
        }
        if (config.application.name) {
          this.applicationName = config.application.name
        }
      }
    },(err) => console.log(err))
  }

  initTotal () {
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      this.mode = paramMap.get('entity')
      if (this.mode === 'wallet') {
        this.totalPrice = parseFloat(sessionStorage.getItem('walletTotal'))
      } else if (this.mode === 'deluxe') {
        this.userService.deluxeStatus().subscribe((res) => {
          this.totalPrice = res.membershipCost
        }, (err) => console.log(err))
      } else {
        const itemTotal = parseFloat(sessionStorage.getItem('itemTotal'))
        const promotionalDiscount = sessionStorage.getItem('couponDiscount') ? (parseFloat(sessionStorage.getItem('couponDiscount')) / 100) * itemTotal : 0
        this.deliveryService.getById(sessionStorage.getItem('deliveryMethodId')).subscribe((method) => {
          const deliveryPrice = method.price
          this.totalPrice = itemTotal + deliveryPrice - promotionalDiscount
        })
      }
    },(err) => console.log(err))
  }

  applyCoupon () {
    this.campaignCoupon = this.couponControl.value
    this.clientDate = new Date()
    const offsetTimeZone = (this.clientDate.getTimezoneOffset() + 60) * 60 * 1000
    this.clientDate.setHours(0,0,0,0)
    this.clientDate = this.clientDate.getTime() - offsetTimeZone
    sessionStorage.setItem('couponDetails', this.campaignCoupon + '-' + this.clientDate)
    const campaign = this.campaigns[this.couponControl.value]
    if (campaign) {
      if (this.clientDate === campaign.validOn) {
        this.showConfirmation(campaign.discount)
      } else {
        this.couponConfirmation = undefined
        this.translate.get('INVALID_COUPON').subscribe((invalidCoupon) => {
          this.couponError = { error: invalidCoupon }
        }, (translationId) => {
          this.couponError = { error: translationId }
        })
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
    this.initTotal()
  }

  getMessage (id) {
    this.paymentId = id
    this.payUsingWallet = false
  }

  choosePayment () {
    sessionStorage.removeItem('itemTotal')
    if (this.mode === 'wallet') {
      this.walletService.put({ balance: this.totalPrice }).subscribe(() => {
        sessionStorage.removeItem('walletTotal')
        this.router.navigate(['/wallet'])
      },(err) => console.log(err))
    } else if (this.mode === 'deluxe') {
      this.userService.upgradeToDeluxe(this.payUsingWallet).subscribe(() => {
        this.logout()
      }, (err) => console.log(err))
    } else {
      if (this.payUsingWallet) {
        sessionStorage.setItem('paymentId', 'wallet')
      } else {
        sessionStorage.setItem('paymentId', this.paymentId)
      }
      this.router.navigate(['/order-summary'])
    }
  }

  logout () {
    this.userService.saveLastLoginIp().subscribe((user: any) => { this.noop() }, (err) => console.log(err))
    localStorage.removeItem('token')
    this.cookieService.remove('token')
    sessionStorage.removeItem('bid')
    this.userService.isLoggedIn.next(false)
    this.router.navigate(['/login'])
  }

  // tslint:disable-next-line:no-empty
  noop () { }

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

  useWallet () {
    this.payUsingWallet = true
  }

  resetCouponForm () {
    this.couponControl.setValue('')
    this.couponControl.markAsPristine()
    this.couponControl.markAsUntouched()
  }
}
