import { QrCodeComponent } from './../qr-code/qr-code.component'
import { MatDialog } from '@angular/material/dialog'
import { FormControl, Validators } from '@angular/forms'
import { WindowRefService } from './../Services/window-ref.service'
import { Router } from '@angular/router'
import { UserService } from './../Services/user.service'
import { BasketService } from './../Services/basket.service'
import { Component,OnInit } from '@angular/core'
import fontawesome from '@fortawesome/fontawesome'
import { faMinusSquare, faPlusSquare, faCartArrowDown, faCreditCard, faGift, faHeart, faThumbsUp } from '@fortawesome/fontawesome-free-solid'
import { faTrashAlt,faCreditCard as faCredit } from '@fortawesome/fontawesome-free-regular/'
import { faPaypal,faEthereum, faBtc } from '@fortawesome/fontawesome-free-brands'
import { ConfigurationService } from 'src/app/Services/configuration.service'
fontawesome.library.add(faMinusSquare, faPlusSquare, faCartArrowDown, faGift, faCreditCard, faTrashAlt, faHeart, faBtc, faPaypal, faEthereum, faCredit, faThumbsUp)

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css']
})
export class BasketComponent implements OnInit {

  public userEmail: string
  public displayedColumns = ['product','description','price','quantity','total price','remove']
  public dataSource = []
  public couponPanelExpanded: boolean = false
  public paymentPanelExpanded: boolean = false
  public couponControl: FormControl = new FormControl('',[Validators.required, Validators.minLength(10), Validators.maxLength(10)])
  public error = undefined
  public confirmation = undefined
  public twitterUrl = null
  public facebookUrl = null
  public applicationName = 'OWASP Juice Shop'

  constructor (private dialog: MatDialog,private basketService: BasketService,private userService: UserService,private windowRefService: WindowRefService,private configurationService: ConfigurationService) {}

  ngOnInit () {
    this.load()
    this.userService.whoAmI().subscribe((data) => {
      this.userEmail = data.email || 'anonymous'
      this.userEmail = '(' + this.userEmail + ')'
    },(err) => err)

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
    })
  }

  load () {
    this.basketService.find(sessionStorage.getItem('bid')).subscribe((basket) => {
      this.dataSource = basket.Products
    })
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
    this.basketService.checkout(sessionStorage.getItem('bid')).subscribe((orderConfirmationPath) => {
      this.windowRefService.nativeWindow.location.replace(this.basketService.hostServer + orderConfirmationPath)
    }, (err) => console.log(err))
  }

  applyCoupon () {
    this.basketService.applyCoupon(sessionStorage.getItem('bid'), encodeURIComponent(this.couponControl.value)).subscribe((data: any) => {
      this.resetForm()
      this.error = undefined
      this.confirmation = data
    },(err) => {
      console.log(err)
      this.confirmation = undefined
      this.error = err
      this.resetForm()
    })
  }

  showBitcoinQrCode () {
    this.dialog.open(QrCodeComponent, {
      data: {
        data: 'bitcoin:1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        url: 'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        address: '1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        title: 'TITLE_BITCOIN_ADDRESS'
      }
    })
  }

  showDashQrCode () {
    this.dialog.open(QrCodeComponent, {
      data: {
        data: 'dash:Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        url: 'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        address: 'Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        title: 'TITLE_DASH_ADDRESS'
      }
    })
  }

  showEtherQrCode () {
    this.dialog.open(QrCodeComponent, {
      data: {
        data: '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6',
        url: 'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6',
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
