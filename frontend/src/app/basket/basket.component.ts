import { TranslateService } from '@ngx-translate/core'
import { QrCodeComponent } from '../qr-code/qr-code.component'
import { MatDialog } from '@angular/material/dialog'
import { FormControl, Validators } from '@angular/forms'
import { WindowRefService } from '../Services/window-ref.service'
import { ConfigurationService } from '../Services/configuration.service'
import { UserService } from '../Services/user.service'
import { BasketService } from '../Services/basket.service'
import { Component, OnInit } from '@angular/core'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import {
  faCartArrowDown,
  faCreditCard,
  faGift,
  faHeart,
  faMinusSquare,
  faPlusSquare,
  faThumbsUp,
  faTshirt,
  faStickyNote,
  faHandHoldingUsd,
  faCoffee
} from '@fortawesome/free-solid-svg-icons'
import { faCreditCard as faCredit, faTrashAlt } from '@fortawesome/free-regular-svg-icons/'
import { faBtc, faEthereum, faPaypal, faLeanpub, faPatreon } from '@fortawesome/free-brands-svg-icons'

library.add(faMinusSquare, faPlusSquare, faCartArrowDown, faGift, faCreditCard, faTrashAlt, faHeart, faBtc, faPaypal, faLeanpub, faEthereum, faCredit, faThumbsUp, faTshirt, faStickyNote, faHandHoldingUsd, faCoffee, faPatreon)
dom.watch()

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit {

  public userEmail: string
  public displayedColumns = ['product','price','quantity','total price','remove']
  public dataSource = []
  public bonus = 0
  public couponPanelExpanded: boolean = false
  public paymentPanelExpanded: boolean = false
  public couponControl: FormControl = new FormControl('',[Validators.required, Validators.minLength(10), Validators.maxLength(10)])
  public error = undefined
  public confirmation = undefined
  public twitterUrl = null
  public facebookUrl = null
  public applicationName = 'OWASP Juice Shop'
  public redirectUrl = null
  public clientDate: any
  private campaignCoupon: string

  constructor (private dialog: MatDialog,private basketService: BasketService,private userService: UserService,private windowRefService: WindowRefService,private configurationService: ConfigurationService,private translateService: TranslateService) {}

  ngOnInit () {
    this.load()
    this.userService.whoAmI().subscribe((data) => {
      this.userEmail = data.email || 'anonymous'
      this.userEmail = '(' + this.userEmail + ')'
    },(err) => console.log(err))

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

  load () {
    this.basketService.find(sessionStorage.getItem('bid')).subscribe((basket) => {
      this.dataSource = basket.Products
      let bonusPoints = 0
      basket.Products.map(product => {
        if (product.BasketItem && product.BasketItem.quantity) {
          bonusPoints += Math.round(product.price / 10) * product.BasketItem.quantity
        }
      })
      this.bonus = bonusPoints
    },(err) => console.log(err))
  }

  delete (id) {
    this.basketService.del(id).subscribe(() => {
      this.load()
    }, (err) => console.log(err))
  }

  inc (id) {
    this.addToQuantity(id,1)
  }

  dec (id) {
    this.addToQuantity(id,-1)
  }

  addToQuantity (id,value) {
    this.basketService.get(id).subscribe((basketItem) => {
      let newQuantity = basketItem.quantity + value
      this.basketService.put(id, { quantity: newQuantity < 1 ? 1 : newQuantity }).subscribe(() => {
        this.load()
      },(err) => console.log(err))
    }, (err) => console.log(err))
  }

  toggleCoupon () {
    this.couponPanelExpanded = !this.couponPanelExpanded
    localStorage.setItem('couponPanelExpanded',JSON.stringify(this.couponPanelExpanded))
  }

  togglePayment () {
    this.paymentPanelExpanded = !this.paymentPanelExpanded
    localStorage.setItem('paymentPanelExpanded',JSON.stringify(this.paymentPanelExpanded))
  }

  checkout () {
    this.basketService.checkout(sessionStorage.getItem('bid'), btoa(this.campaignCoupon + '-' + this.clientDate)).subscribe((orderConfirmationPath) => {
      this.redirectUrl = this.basketService.hostServer + orderConfirmationPath
      this.windowRefService.nativeWindow.location.replace(this.redirectUrl)
    }, (err) => console.log(err))
  }

  applyCoupon () {
    this.campaignCoupon = this.couponControl.value
    this.clientDate = new Date()
    this.clientDate.setHours(0,0,0,0)
    this.clientDate = this.clientDate.getTime()
    if (this.couponControl.value === 'WMNSDY2019') { // TODO Use internal code table or retrieve from AWS Lambda instead
      if (this.clientDate === 1551999600000) { // = Mar 08, 2019
        this.showConfirmation(75)
      } else {
        this.confirmation = undefined
        this.error = { error: 'Invalid Coupon.' } // FIXME i18n error message
        this.resetForm()
      }
    } else {
      this.basketService.applyCoupon(sessionStorage.getItem('bid'), encodeURIComponent(this.couponControl.value)).subscribe((discount: any) => {
        this.showConfirmation(discount)
      },(err) => {
        this.confirmation = undefined
        this.error = err
        this.resetForm()
      })
    }
  }

  showConfirmation (discount) {
    this.resetForm()
    this.error = undefined
    this.translateService.get('DISCOUNT_APPLIED', { discount }).subscribe((discountApplied) => {
      this.confirmation = discountApplied
    }, (translationId) => {
      this.confirmation = translationId
    })
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

  resetForm () {
    this.couponControl.setValue('')
    this.couponControl.markAsPristine()
    this.couponControl.markAsUntouched()
  }
}
