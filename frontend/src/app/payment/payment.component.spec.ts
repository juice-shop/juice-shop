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
import { QrCodeComponent } from '../qr-code/qr-code.component'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { PaymentMethodComponent } from '../payment-method/payment-method.component'

describe('PaymentComponent', () => {
  let component: PaymentComponent
  let fixture: ComponentFixture<PaymentComponent>
  let configurationService
  let translateService
  let basketService
  let dialog

  beforeEach(async(() => {

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
      declarations: [ PaymentComponent, PaymentMethodComponent ],
      providers: [
        { provide: BasketService, useValue: basketService },
        { provide: MatDialog, useValue: dialog },
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
    expect(component.couponError).toBeUndefined()
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
