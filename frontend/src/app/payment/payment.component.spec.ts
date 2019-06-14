import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'
import { PaymentComponent } from './payment.component'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BarRatingModule } from 'ng2-bar-rating'
import { of, throwError } from 'rxjs'
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { ConfigurationService } from '../Services/configuration.service'
import { EventEmitter } from '@angular/core'
import { BasketService } from '../Services/basket.service'
import { PaymentService } from '../Services/payment.service'
import { QrCodeComponent } from '../qr-code/qr-code.component'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'

describe('PaymentComponent', () => {
  let component: PaymentComponent
  let fixture: ComponentFixture<PaymentComponent>
  let paymentService
  let configurationService
  let translateService
  let basketService
  let dialog

  beforeEach(async(() => {

    paymentService = jasmine.createSpyObj('BasketService', ['save','get'])
    paymentService.save.and.returnValue(of([]))
    paymentService.get.and.returnValue(of([]))
    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    basketService = jasmine.createSpyObj('BasketService', ['applyCoupon'])
    basketService.applyCoupon.and.returnValue(of({}))
    dialog = jasmine.createSpyObj('MatDialog',['open'])
    dialog.open.and.returnValue(null)

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,
        BarRatingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatExpansionModule,
        MatDividerModule,
        MatRadioModule,
        MatDialogModule
      ],
      declarations: [ PaymentComponent ],
      providers: [
        { provide: BasketService, useValue: basketService },
        { provide: MatDialog, useValue: dialog },
        { provide: PaymentService, useValue: paymentService },
        { provide: TranslateService, useValue: translateService },
        { provide: ConfigurationService, useValue: configurationService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not hold twitter or facebook URL if not defined in configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    expect(component.twitterUrl).toBeNull()
    expect(component.facebookUrl).toBeNull()
  })

  it('should use custom twitter URL if configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { twitterUrl: 'twitter' } }))
    component.ngOnInit()
    expect(component.twitterUrl).toBe('twitter')
  })

  it('should use custom facebook URL if configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { facebookUrl: 'facebook' } }))
    component.ngOnInit()
    expect(component.facebookUrl).toBe('facebook')
  })

  it('should log error while getting application configuration from backend API directly to browser console', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should hold cards returned by backend API', () => {
    paymentService.get.and.returnValue(of([{ cardNum: '1' }, { cardNum: '2' }]))
    component.ngOnInit()
    expect(component.storedCards.length).toBe(2)
    expect(component.storedCards[0].cardNum).toBe('1')
    expect(component.storedCards[1].cardNum).toBe('2')
  })

  it('should hold no cards on error in backend API', fakeAsync(() => {
    paymentService.get.and.returnValue(throwError('Error'))
    component.ngOnInit()
    expect(component.storedCards.length).toBe(0)
  }))

  it('should hold no cards when none are returned by backend API', () => {
    paymentService.get.and.returnValue(of([]))
    component.ngOnInit()
    expect(component.storedCards).toEqual([])
  })

  it('should log error while getting Cards from backend API directly to browser console' , fakeAsync(() => {
    paymentService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should reinitizalise new payment method form by calling resetForm', () => {
    component.nameControl.setValue('jim')
    component.numberControl.setValue(9999999999999999)
    component.pinControl.setValue(999)
    component.monthControl.setValue(12)
    component.yearControl.setValue(new Date().getFullYear())
    component.resetForm()
    expect(component.nameControl.value).toBe('')
    expect(component.nameControl.pristine).toBe(true)
    expect(component.nameControl.untouched).toBe(true)
    expect(component.numberControl.value).toBe('')
    expect(component.numberControl.pristine).toBe(true)
    expect(component.numberControl.untouched).toBe(true)
    expect(component.pinControl.value).toBe('')
    expect(component.pinControl.pristine).toBe(true)
    expect(component.pinControl.untouched).toBe(true)
    expect(component.monthControl.value).toBe('')
    expect(component.monthControl.pristine).toBe(true)
    expect(component.monthControl.untouched).toBe(true)
    expect(component.yearControl.value).toBe('')
    expect(component.yearControl.pristine).toBe(true)
    expect(component.yearControl.untouched).toBe(true)
  })

  it('should be compulsory to provide name', () => {
    component.nameControl.setValue('')
    expect(component.nameControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide card number', () => {
    component.numberControl.setValue('')
    expect(component.numberControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide pin', () => {
    component.pinControl.setValue('')
    expect(component.pinControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide month', () => {
    component.monthControl.setValue('')
    expect(component.monthControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide year', () => {
    component.yearControl.setValue('')
    expect(component.yearControl.valid).toBeFalsy()
  })

  it('card number should be in the range [1000000000000000, 9999999999999999]', () => {
    component.numberControl.setValue(1111110)
    expect(component.numberControl.valid).toBeFalsy()
    component.numberControl.setValue(99999999999999999)
    expect(component.numberControl.valid).toBeFalsy()
    component.numberControl.setValue(9999999999999999)
    expect(component.numberControl.valid).toBe(true)
    component.numberControl.setValue(1234567887654321)
    expect(component.numberControl.valid).toBe(true)
  })

  it('pin should be in the range [100, 999]', () => {
    component.pinControl.setValue(99)
    expect(component.pinControl.valid).toBeFalsy()
    component.pinControl.setValue(1000)
    expect(component.pinControl.valid).toBeFalsy()
    component.pinControl.setValue(100)
    expect(component.pinControl.valid).toBe(true)
    component.pinControl.setValue(999)
    expect(component.pinControl.valid).toBe(true)
  })

  it('should reset the form on saving card and show confirmation', () => {
    paymentService.get.and.returnValue(of([]))
    paymentService.save.and.returnValue(of({ cardNum: '1234' }))
    spyOn(component,'resetForm')
    spyOn(component,'ngOnInit')
    component.save()
    expect(component.confirmation).toBe('Your card ending with 1234 has been saved for your convinience.')
    expect(component.ngOnInit).toHaveBeenCalled()
    expect(component.resetForm).toHaveBeenCalled()
  })

  it('should clear the form and display error if saving card fails', fakeAsync(() => {
    paymentService.save.and.returnValue(throwError({ error: 'Error' }))
    spyOn(component,'resetForm')
    component.save()
    expect(component.confirmation).toBeNull()
    expect(component.error).toBe('Error')
    expect(component.resetForm).toHaveBeenCalled()
  }))

  it('should be compulsory to provide cvv', () => {
    component.cvvControl.setValue('')
    expect(component.cvvControl.valid).toBeFalsy()
  })

  it('cvv should be in the range [100, 999]', () => {
    component.cvvControl.setValue(99)
    expect(component.cvvControl.valid).toBeFalsy()
    component.cvvControl.setValue(1000)
    expect(component.cvvControl.valid).toBeFalsy()
    component.cvvControl.setValue(100)
    expect(component.cvvControl.valid).toBe(true)
    component.cvvControl.setValue(999)
    expect(component.cvvControl.valid).toBe(true)
  })

  it('should reinitizalise coupon code form by calling resetCouponForm', () => {
    component.couponControl.setValue('1234567890')
    component.resetCouponForm()
    expect(component.couponControl.value).toBe('')
    expect(component.couponControl.pristine).toBe(true)
    expect(component.couponControl.untouched).toBe(true)
  })

  it('should reject an invalid coupon code', fakeAsync(() => {
    basketService.applyCoupon.and.returnValue(throwError('Error'))

    component.couponControl.setValue('')
    component.couponControl.markAsPristine()
    component.couponControl.markAsUntouched()

    component.couponControl.setValue('invalid_base85')
    component.applyCoupon()

    expect(component.couponConfirmation).toBeUndefined()
    expect(component.couponError).toBe('Error')
  }))

  it('should accept a valid coupon code', () => {
    basketService.applyCoupon.and.returnValue(of(42))
    translateService.get.and.returnValue(of('DISCOUNT_APPLIED'))

    component.couponControl.setValue('')
    component.couponControl.markAsPristine()
    component.couponControl.markAsUntouched()

    component.couponControl.setValue('valid_base85')
    component.applyCoupon()

    expect(translateService.get).toHaveBeenCalledWith('DISCOUNT_APPLIED',{ discount: 42 })
    expect(component.error).toBeUndefined()
  })

  it('should translate DISCOUNT_APPLIED message' , () => {
    basketService.applyCoupon.and.returnValue(of(42))
    translateService.get.and.returnValue(of('Translation of DISCOUNT_APPLIED'))
    component.couponControl.setValue('')
    component.couponControl.markAsPristine()
    component.couponControl.markAsUntouched()

    component.couponControl.setValue('valid_base85')
    component.applyCoupon()

    expect(component.couponConfirmation).toBe('Translation of DISCOUNT_APPLIED')
    expect(component.couponError).toBeUndefined()
  })

  it('should open QrCodeComponent for Bitcoin', () => {
    component.showBitcoinQrCode()
    const data = {
      data: {
        data: 'bitcoin:1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        url: '/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        address: '1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        title: 'TITLE_BITCOIN_ADDRESS'
      }
    }
    expect(dialog.open).toHaveBeenCalledWith(QrCodeComponent,data)
  })

  it('should open QrCodeComponent for Dash', () => {
    component.showDashQrCode()
    const data = {
      data: {
        data: 'dash:Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        url: '/redirect?to=https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        address: 'Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        title: 'TITLE_DASH_ADDRESS'
      }
    }
    expect(dialog.open).toHaveBeenCalledWith(QrCodeComponent,data)
  })

  it('should open QrCodeComponent for Ether', () => {
    component.showEtherQrCode()
    const data = {
      data: {
        data: '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6',
        url: '/redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6',
        address: '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6',
        title: 'TITLE_ETHER_ADDRESS'
      }
    }
    expect(dialog.open).toHaveBeenCalledWith(QrCodeComponent,data)
  })
})
