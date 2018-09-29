import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { ConfigurationService } from './../Services/configuration.service'
import { WindowRefService } from './../Services/window-ref.service'
import { UserService } from './../Services/user.service'
import { BasketService } from './../Services/basket.service'
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'

import { BasketComponent } from './basket.component'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientModule } from '@angular/common/http'
import { ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { of } from 'rxjs'
import { throwError } from 'rxjs/internal/observable/throwError'
import { By } from '@angular/platform-browser'
import { QrCodeComponent } from './../qr-code/qr-code.component'
import { MatButtonToggleModule } from '@angular/material/button-toggle'

describe('BasketComponent', () => {
  let component: BasketComponent
  let fixture: ComponentFixture<BasketComponent>
  let dialog
  let userService
  let basketService
  let windowRefService
  let configurationService
  let translateService

  beforeEach(async(() => {

    dialog = jasmine.createSpyObj('MatDialog',['open'])
    dialog.open.and.returnValue(null)
    userService = jasmine.createSpyObj('UserService',['whoAmI'])
    userService.whoAmI.and.returnValue(of({}))
    basketService = jasmine.createSpyObj('BasketService', ['find','del','get','put','checkout','applyCoupon'])
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.del.and.returnValue(of({}))
    basketService.get.and.returnValue(of({}))
    basketService.put.and.returnValue(of({}))
    basketService.checkout.and.returnValue(of({}))
    basketService.applyCoupon.and.returnValue(of({}))

    // Stub for WindowRefService
    windowRefService = {
      get nativeWindow () {
        return {
          location: {
            replace (str) {
              return null
            }
          }
        }
      }
    }

    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatExpansionModule,
        MatDialogModule,
        MatButtonToggleModule
      ],
      declarations: [ BasketComponent ],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: BasketService, useValue: basketService },
        { provide: UserService , useValue: userService },
        { provide: WindowRefService, useValue: windowRefService },
        { provide: ConfigurationService, useValue: configurationService },
        TranslateService
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load user email when being created' , () => {
    userService.whoAmI.and.returnValue(of({ email: 'a@a' }))
    component.ngOnInit()
    expect(component.userEmail).toBe('(a@a)')
  })

  it('should log an error if userService fails to fetch the user', fakeAsync(() => {
    userService.whoAmI.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

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

  it('should hold products returned by backend API', () => {
    basketService.find.and.returnValue(of({ Products: [{ name: 'Product1' }, { name: 'Product2' }] }))
    component.ngOnInit()
    expect(component.dataSource.length).toBe(2)
    expect(component.dataSource[0].name).toBe('Product1')
    expect(component.dataSource[1].name).toBe('Product2')
  })

  it('should hold no products on error in backend API', fakeAsync(() => {
    basketService.find.and.returnValue(throwError('Error'))
    component.ngOnInit()
    expect(component.dataSource.length).toBe(0)
  }))

  it('should hold no products when none are returned by backend API', () => {
    basketService.find.and.returnValue(of({ Products: [] }))
    component.ngOnInit()
    expect(component.dataSource).toEqual([])
  })

  it('should log error while getting Products from backend API directly to browser console' , fakeAsync(() => {
    basketService.find.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')

    component.load()

    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should pass delete request for basket item via BasketService' , () => {
    component.delete(1)
    expect(basketService.del).toHaveBeenCalledWith(1)
  })

  it('should load again after deleting a basket item' , () => {
    basketService.find.and.returnValue(of({ Products: [{ name: 'Product1' }, { name: 'Product2' }] }))
    component.delete(1)
    expect(component.dataSource.length).toBe(2)
    expect(component.dataSource[0].name).toBe('Product1')
    expect(component.dataSource[1].name).toBe('Product2')
  })

  it('should log error while deleting basket item directly to browser console' , fakeAsync(() => {
    basketService.del.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.delete(1)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should update basket item with increased quantity after adding another item of same type' , () => {
    basketService.find.and.returnValue(of({ Products: [ { basketItem: { id: 1, quantity: 1 } } ] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 1 }))

    component.inc(1)
    expect(basketService.get).toHaveBeenCalledWith(1)
    expect(basketService.put).toHaveBeenCalledWith(1,{ quantity: 2 })
  })

  it('should not increase quantity on error retrieving basket item and log the error', fakeAsync(() => {
    basketService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.inc(1)
    expect(console.log).toHaveBeenCalledWith('Error')
    expect(basketService.put).not.toHaveBeenCalled()
  }))

  it('should not increase quantity on error updating basket item and log the error', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [ { basketItem: { id: 1, quantity: 1 } } ] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 1 }))
    basketService.put.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.inc(1)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should load again after increasing product quantity', () => {
    basketService.find.and.returnValue(of({ Products: [ { basketItem: { id: 1, quantity: 2 } } ] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 2 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 3 }))

    component.inc(1)
    expect(basketService.find).toHaveBeenCalled()
  })

  it('should update basket item with decreased quantity after removing an item' , () => {
    basketService.find.and.returnValue(of({ Products: [ { basketItem: { id: 1, quantity: 2 } } ] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 2 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 1 }))

    component.dec(1)
    expect(basketService.get).toHaveBeenCalledWith(1)
    expect(basketService.put).toHaveBeenCalledWith(1,{ quantity: 1 })
  })

  it('should always keep one item of any product in the basket when reducing quantity via UI', () => {
    basketService.find.and.returnValue(of({ Products: [ { basketItem: { id: 1, quantity: 1 } } ] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 1 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 1 }))

    component.dec(1)
    expect(basketService.get).toHaveBeenCalledWith(1)
    expect(basketService.put).toHaveBeenCalledWith(1,{ quantity: 1 })
  })

  it('should not decrease quantity on error retrieving basket item and log the error', fakeAsync(() => {
    basketService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.dec(1)
    expect(console.log).toHaveBeenCalledWith('Error')
    expect(basketService.put).not.toHaveBeenCalled()
  }))

  it('should not decrease quantity on error updating basket item and log the error', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [ { basketItem: { id: 1, quantity: 1 } } ] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 1 }))
    basketService.put.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.dec(1)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should load again after decreasing product quantity' , () => {
    basketService.find.and.returnValue(of({ Products: [ { basketItem: { id: 1, quantity: 2 } } ] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 2 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 1 }))

    component.dec(1)
    expect(basketService.find).toHaveBeenCalled()
  })

  it('should reset quantity to 1 when decreasing for quantity tampered to be negative', () => {
    basketService.find.and.returnValue(of({ Products: [ { basketItem: { id: 1, quantity: -100 } } ] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: -100 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 1 }))

    component.dec(1)
    expect(basketService.get).toHaveBeenCalledWith(1)
    expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 1 })
  })

  it('should reset quantity to 1 when increasing for quantity tampered to be negative', () => {
    basketService.find.and.returnValue(of({ Products: [ { basketItem: { id: 1, quantity: -100 } } ] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: -100 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 1 }))

    component.inc(1)
    expect(basketService.get).toHaveBeenCalledWith(1)
    expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 1 })
  })

  it('should toggle the coupon panel on clicking the coupon-toggle button', () => {
    const couponToggle = fixture.debugElement.query(By.css('mat-button-toggle.coupon-toggle'))
    let initValue = component.couponPanelExpanded
    couponToggle.triggerEventHandler('change',null)
    expect(component.couponPanelExpanded).toBe(!initValue)
  })

  it('should toggle the payment panel on clicking the payment-toggle button', () => {
    const paymentToggle = fixture.debugElement.query(By.css('mat-button-toggle.payment-toggle'))
    let initValue = component.paymentPanelExpanded
    paymentToggle.triggerEventHandler('change',null)
    expect(component.paymentPanelExpanded).toBe(!initValue)
  })

  it('should redirect to confirmation URL after ordering basket', () => {
    basketService.checkout.and.returnValue(of('/ftp/some.pdf'))
    component.checkout()
    expect(component.redirectUrl).toContain('/ftp/some.pdf')
  })

  it('should not redirect anywhere when ordering basket fails and log the error', fakeAsync(() => {
    basketService.checkout.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    const windowSpy = spyOnProperty(windowRefService,'nativeWindow','get')
    component.checkout()
    expect(component.redirectUrl).toBeNull()
    expect(windowSpy).not.toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should reject an invalid coupon code', fakeAsync(() => {
    basketService.applyCoupon.and.returnValue(throwError('Error'))

    component.couponControl.setValue('')
    component.couponControl.markAsPristine()
    component.couponControl.markAsUntouched()

    component.couponControl.setValue('invalid_base85')
    component.applyCoupon()

    expect(component.confirmation).toBeUndefined()
    expect(component.error).toBe('Error')
  }))

  xit('should accept a valid coupon code', () => {
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

  xit('should translate DISCOUNT_APPLIED message' , () => {
    basketService.applyCoupon.and.returnValue(of(42))
    translateService.get.and.returnValue(of('Translation of DISCOUNT_APPLIED'))
    component.couponControl.setValue('')
    component.couponControl.markAsPristine()
    component.couponControl.markAsUntouched()

    component.couponControl.setValue('valid_base85')
    component.applyCoupon()
    expect(component.confirmation).toBe('Translation of DISCOUNT_APPLIED')
    expect(component.error).toBeUndefined()
  })

  it('should have five columns in basket table', () => {
    expect(component.displayedColumns.length).toBe(5)
    expect(component.displayedColumns[0]).toBe('product')
    expect(component.displayedColumns[1]).toBe('price')
    expect(component.displayedColumns[2]).toBe('quantity')
    expect(component.displayedColumns[3]).toBe('total price')
    expect(component.displayedColumns[4]).toBe('remove')
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
        url: 'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6',
        address: '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6',
        title: 'TITLE_ETHER_ADDRESS'
      }
    }
    expect(dialog.open).toHaveBeenCalledWith(QrCodeComponent,data)
  })
})
