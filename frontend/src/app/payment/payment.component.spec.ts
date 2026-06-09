/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { PaymentComponent } from './payment.component'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'

import { of, throwError } from 'rxjs'
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { ConfigurationService } from '../Services/configuration.service'
import { Component, EventEmitter, provideZoneChangeDetection } from '@angular/core'
import { BasketService } from '../Services/basket.service'
import { QrCodeComponent } from '../qr-code/qr-code.component'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { PaymentMethodComponent } from '../payment-method/payment-method.component'
import { RouterModule } from '@angular/router'
import { OrderSummaryComponent } from '../order-summary/order-summary.component'
import { PurchaseBasketComponent } from '../purchase-basket/purchase-basket.component'
import { CookieService } from 'ngy-cookie'
import { WalletService } from '../Services/wallet.service'
import { DeliveryService } from '../Services/delivery.service'
import { UserService } from '../Services/user.service'
import { LoginComponent } from '../login/login.component'
import { Location } from '@angular/common'
import { WalletComponent } from '../wallet/wallet.component'
import { MatIconModule } from '@angular/material/icon'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

describe('PaymentComponent', () => {
    let component: PaymentComponent
    let fixture: ComponentFixture<PaymentComponent>
    let configurationService
    let translateService
    let basketService
    let dialog
    let cookieService: any
    let walletService: any
    let deliveryService: any
    let userService: any
    let snackBar: any

    @Component({ template: '' })
    class DummyDeluxeMembershipComponent {
    }

    beforeEach(async () => {
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({}))
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        translateService.onLangChange = new EventEmitter()
        translateService.onTranslationChange = new EventEmitter()
        translateService.onFallbackLangChange = new EventEmitter()
        translateService.onDefaultLangChange = new EventEmitter()
        basketService = {
            applyCoupon: vi.fn().mockName("BasketService.applyCoupon")
        }
        basketService.applyCoupon.mockReturnValue(of({}))
        dialog = {
            open: vi.fn().mockName("MatDialog.open")
        }
        dialog.open.mockReturnValue(null)
        cookieService = {
            remove: vi.fn().mockName("CookieService.remove"),
            put: vi.fn().mockName("CookieService.put")
        }
        walletService = {
            get: vi.fn().mockName("AddressService.get"),
            put: vi.fn().mockName("AddressService.put")
        }
        walletService.get.mockReturnValue(of({}))
        walletService.put.mockReturnValue(of({}))
        deliveryService = {
            getById: vi.fn().mockName("DeliveryService.getById")
        }
        deliveryService.getById.mockReturnValue(of({ price: 10 }))
        userService = {
            deluxeStatus: vi.fn().mockName("UserService.deluxeStatus"),
            upgradeToDeluxe: vi.fn().mockName("UserService.upgradeToDeluxe"),
            saveLastLoginIp: vi.fn().mockName("UserService.saveLastLoginIp")
        }
        userService.deluxeStatus.mockReturnValue(of({}))
        userService.upgradeToDeluxe.mockReturnValue(of({}))
        userService.isLoggedIn = {
            next: vi.fn().mockName("userService.isLoggedIn.next")
        }
        userService.isLoggedIn.next.mockReturnValue({})
        userService.saveLastLoginIp.mockReturnValue(of({}))
        snackBar = {
            open: vi.fn().mockName("MatSnackBar.open")
        }

        TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([
                    { path: 'order-summary', component: OrderSummaryComponent },
                    { path: 'login', component: LoginComponent },
                    { path: 'wallet', component: WalletComponent },
                    { path: 'deluxe-membership', component: DummyDeluxeMembershipComponent }
                ]),
                TranslateModule.forRoot(),
                ReactiveFormsModule,
                MatCardModule,
                MatTableModule,
                MatFormFieldModule,
                MatInputModule,
                MatExpansionModule,
                MatDividerModule,
                MatRadioModule,
                MatDialogModule,
                MatIconModule,
                MatCheckboxModule,
                MatTooltipModule,
                PaymentComponent, PaymentMethodComponent, OrderSummaryComponent, PurchaseBasketComponent, LoginComponent, WalletComponent],
            providers: [
                { provide: BasketService, useValue: basketService },
                { provide: MatDialog, useValue: dialog },
                { provide: TranslateService, useValue: translateService },
                { provide: ConfigurationService, useValue: configurationService },
                { provide: CookieService, useValue: cookieService },
                { provide: WalletService, useValue: walletService },
                { provide: DeliveryService, useValue: deliveryService },
                { provide: UserService, useValue: userService },
                { provide: MatSnackBar, useValue: snackBar },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
                provideZoneChangeDetection()
            ]
        })
            .compileComponents()
        TestBed.inject(Location)
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(PaymentComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should not hold blueSky or reddit URL if not defined in configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({}))
        expect(component.blueSkyUrl).toBeNull()
        expect(component.redditUrl).toBeNull()
    })

    it('should hold the default applicationName if not defined in configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({}))
        expect(component.applicationName).toBe('OWASP Juice Shop')
    })

    it('should use custom blueSky URL if configured', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { blueSkyUrl: 'blueSky' } } }))
        component.ngOnInit()
        expect(component.blueSkyUrl).toBe('blueSky')
    })

    it('should use custom reddit URL if configured', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { redditUrl: 'reddit' } } }))
        component.ngOnInit()
        expect(component.redditUrl).toBe('reddit')
    })

    it('should log error while getting application configuration from backend API directly to browser console', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should reinitizalise coupon code form by calling resetCouponForm', () => {
        component.couponControl.setValue('1234567890')
        component.resetCouponForm()
        expect(component.couponControl.value).toBe('')
        expect(component.couponControl.pristine).toBe(true)
        expect(component.couponControl.untouched).toBe(true)
    })

    it('should reject an invalid coupon code', () => {
        basketService.applyCoupon.mockReturnValue(throwError('Error'))

        component.couponControl.setValue('')
        component.couponControl.markAsPristine()
        component.couponControl.markAsUntouched()

        component.couponControl.setValue('invalid_base85')
        component.applyCoupon()

        expect(component.couponConfirmation).toBeUndefined()
        expect(component.couponError).toBe('Error')
    })

    it('should accept a valid coupon code', () => {
        basketService.applyCoupon.mockReturnValue(of(42))
        translateService.get.mockReturnValue(of('DISCOUNT_APPLIED'))

        component.couponControl.setValue('')
        component.couponControl.markAsPristine()
        component.couponControl.markAsUntouched()

        component.couponControl.setValue('valid_base85')
        component.applyCoupon()

        expect(translateService.get).toHaveBeenCalledWith('DISCOUNT_APPLIED', { discount: 42 })
        expect(component.couponError).toBeUndefined()
    })

    it('should translate DISCOUNT_APPLIED message', () => {
        basketService.applyCoupon.mockReturnValue(of(42))
        translateService.get.mockReturnValue(of('Translation of DISCOUNT_APPLIED'))
        component.couponControl.setValue('')
        component.couponControl.markAsPristine()
        component.couponControl.markAsUntouched()

        component.couponControl.setValue('valid_base85')
        component.applyCoupon()

        expect(component.couponConfirmation).toBe('Translation of DISCOUNT_APPLIED')
        expect(component.couponError).toBeUndefined()
    })

    it('should store discount percent in session storage', () => {
        translateService.get.mockReturnValue(of('Translation of DISCOUNT_APPLIED'))
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        component.showConfirmation(70)
        expect(setItemSpy).toHaveBeenCalledWith('couponDiscount', 70 as any)
    })

    it('should store payment id on calling getMessage', () => {
        component.getMessage(1)
        expect(component.paymentId).toBe(1)
        expect(component.paymentMode).toEqual('card')
    })

    it('should open QrCodeComponent for Bitcoin', () => {
        component.showBitcoinQrCode()
        const data = {
            data: {
                data: 'bitcoin:1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
                url: './redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
                address: '1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
                title: 'TITLE_BITCOIN_ADDRESS'
            }
        }
        expect(dialog.open).toHaveBeenCalledWith(QrCodeComponent, data)
    })

    it('should open QrCodeComponent for Dash', () => {
        component.showDashQrCode()
        const data = {
            data: {
                data: 'dash:Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
                url: './redirect?to=https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
                address: 'Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
                title: 'TITLE_DASH_ADDRESS'
            }
        }
        expect(dialog.open).toHaveBeenCalledWith(QrCodeComponent, data)
    })

    it('should open QrCodeComponent for Ether', () => {
        component.showEtherQrCode()
        const data = {
            data: {
                data: '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6',
                url: './redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6',
                address: '0x0f933ab9fCAAA782D0279C300D73750e1311EAE6',
                title: 'TITLE_ETHER_ADDRESS'
            }
        }
        expect(dialog.open).toHaveBeenCalledWith(QrCodeComponent, data)
    })

    it('should call initTotal on calling ngOnInit', () => {
        vi.spyOn(component, 'initTotal')
        component.ngOnInit()
        expect(component.initTotal).toHaveBeenCalled()
    })

    it('should call initTotal on calling showConfirmation', () => {
        vi.spyOn(component, 'initTotal')
        component.showConfirmation(10)
        expect(component.initTotal).toHaveBeenCalled()
    })

    it('should make paymentMode wallet on calling useWallet', () => {
        component.useWallet()
        expect(component.paymentMode).toEqual('wallet')
    })

    it('should store paymentId in session storage on calling choosePayment in shop mode', () => {
        component.mode = 'shop'
        component.paymentMode = 'card'
        component.paymentId = 1
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        component.choosePayment()
        expect(setItemSpy).toHaveBeenCalledWith('paymentId', 1 as any)
    })

    it('should store wallet as paymentId in session storage on calling choosePayment while paymentMode is equal to wallet', () => {
        component.mode = 'shop'
        component.paymentMode = 'wallet'
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        component.choosePayment()
        expect(setItemSpy).toHaveBeenCalledWith('paymentId', 'wallet')
    })

    it('should log error from upgrade to deluxe API call directly to browser console', () => {
        component.mode = 'deluxe'
        userService.upgradeToDeluxe.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.choosePayment()
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should remove walletTotal from session storage on calling choosePayment in wallet mode', () => {
        component.mode = 'wallet'
        walletService.put.mockReturnValue(of({}))
        const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
        component.choosePayment()
        expect(removeItemSpy).toHaveBeenCalledWith('walletTotal')
    })

    it('should add token to local storage and cookie on calling choosePayment in deluxe mode', () => {
        component.mode = 'deluxe'
        userService.upgradeToDeluxe.mockReturnValue(of({ token: 'tokenValue' }))
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        component.choosePayment()
        expect(setItemSpy).toHaveBeenCalledWith('token', 'tokenValue')
        expect(cookieService.put).toHaveBeenCalledWith('token', 'tokenValue')
    })

    describe('template rendering', () => {
        it('should render the payment method child component, navigation buttons and coupon input in non-wallet mode', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('app-payment-method')).toBeTruthy()
            expect(compiled.querySelector('button[aria-label="Proceed to review"]')).toBeTruthy()
            expect(compiled.querySelector('input#coupon')).toBeTruthy()
            expect(compiled.querySelector('button#applyCouponButton')).toBeTruthy()
        })

        it('should keep the continue button disabled while no payment id is selected', () => {
            const button = (fixture.nativeElement as HTMLElement).querySelector('button[aria-label="Proceed to review"]') as HTMLButtonElement
            expect(button.disabled).toBe(true)
        })

        it('should enable the continue button as soon as a card paymentId is selected', () => {
            component.getMessage(7)
            fixture.detectChanges()
            const button = (fixture.nativeElement as HTMLElement).querySelector('button[aria-label="Proceed to review"]') as HTMLButtonElement
            expect(button.disabled).toBe(false)
        })

        it('should hide the wallet, coupon and other-payments sections when mode is wallet', () => {
            component.mode = 'wallet'
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('input#coupon')).toBeNull()
            expect(compiled.querySelector('#collapseCouponElement')).toBeNull()
        })

        it('should invoke routeToPreviousUrl when the back button is clicked', () => {
            const spy = vi.spyOn(component, 'routeToPreviousUrl').mockImplementation(() => { })
            const back = (fixture.nativeElement as HTMLElement).querySelector('.btn-return') as HTMLButtonElement
            back.click()
            expect(spy).toHaveBeenCalled()
        })
    })

    describe('application configuration handling', () => {
        it('should pick up custom application name from configuration', () => {
            configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: {}, name: 'My Shop' } }))
            component.ngOnInit()
            expect(component.applicationName).toBe('My Shop')
        })

        it('should log error from wallet balance call to browser console', () => {
            walletService.get.mockReturnValue(throwError('Error'))
            console.log = vi.fn()
            component.ngOnInit()
            expect(console.log).toHaveBeenCalledWith('Error')
        })
    })

    describe('initTotal mode handling', () => {
        it('should read totalPrice from walletTotal in session storage in wallet mode', () => {
            sessionStorage.setItem('walletTotal', '12.34')
            const paramMap = { get: () => 'wallet' }
            ;(component as any).activatedRoute = { paramMap: of(paramMap) }
            component.initTotal()
            expect(component.totalPrice).toBeCloseTo(12.34)
            sessionStorage.removeItem('walletTotal')
        })

        it('should read totalPrice from membershipCost in deluxe mode', () => {
            userService.deluxeStatus.mockReturnValue(of({ membershipCost: 49 }))
            const paramMap = { get: () => 'deluxe' }
            ;(component as any).activatedRoute = { paramMap: of(paramMap) }
            component.initTotal()
            expect(component.totalPrice).toBe(49)
        })

        it('should log error when deluxeStatus fails', () => {
            userService.deluxeStatus.mockReturnValue(throwError('Error'))
            console.log = vi.fn()
            const paramMap = { get: () => 'deluxe' }
            ;(component as any).activatedRoute = { paramMap: of(paramMap) }
            component.initTotal()
            expect(console.log).toHaveBeenCalledWith('Error')
        })

        it('should log error when paramMap subscription fails', () => {
            console.log = vi.fn()
            ;(component as any).activatedRoute = { paramMap: throwError('Error') }
            component.initTotal()
            expect(console.log).toHaveBeenCalledWith('Error')
        })
    })

    describe('campaign coupon handling', () => {
        afterEach(() => {
            vi.useRealTimers()
        })

        it('should apply discount when campaign code matches validOn date', () => {
            // Compute the clientDate value as the component does, then inject it into a custom campaign entry,
            // so the test is timezone-independent.
            const today = new Date()
            const offsetTimeZone = (today.getTimezoneOffset() + 60) * 60 * 1000
            today.setHours(0, 0, 0, 0)
            const expectedClientDate = today.getTime() - offsetTimeZone
            ;(component as any).campaigns = { TESTCAMPAIGN: { validOn: expectedClientDate, discount: 50 } }
            translateService.get.mockReturnValue(of('DISCOUNT_APPLIED'))
            component.couponControl.setValue('TESTCAMPAIGN')
            component.applyCoupon()
            expect(component.couponConfirmation).toBe('DISCOUNT_APPLIED')
        })

        it('should set INVALID_COUPON error when campaign date does not match', () => {
            translateService.get.mockReturnValue(of('INVALID_COUPON_MSG'))
            component.couponControl.setValue('WMNSDY2019')
            component.applyCoupon()
            expect(component.couponError).toEqual({ error: 'INVALID_COUPON_MSG' })
            expect(component.couponConfirmation).toBeUndefined()
        })

        it('should fall back to translation id when INVALID_COUPON translation errors out', () => {
            translateService.get.mockReturnValue(throwError('FALLBACK_ID'))
            component.couponControl.setValue('WMNSDY2019')
            component.applyCoupon()
            expect(component.couponError).toEqual({ error: 'FALLBACK_ID' })
        })

        it('should fall back to translation id when DISCOUNT_APPLIED translation errors out', () => {
            translateService.get.mockReturnValue(throwError('FALLBACK_ID'))
            component.showConfirmation(50)
            expect(component.couponConfirmation).toBe('FALLBACK_ID')
        })
    })

    describe('navigation helper', () => {
        it('should navigate back via Location on routeToPreviousUrl', () => {
            const location = TestBed.inject(Location)
            const backSpy = vi.spyOn(location, 'back').mockImplementation(() => {})
            component.routeToPreviousUrl()
            expect(backSpy).toHaveBeenCalled()
        })
    })

    describe('choosePayment edge cases', () => {
        it('should block wallet payment when balance is insufficient and notify via snack bar', () => {
            const helper = TestBed.inject(SnackBarHelperService)
            const openSpy = vi.spyOn(helper, 'open').mockImplementation(() => {})
            component.mode = 'shop'
            component.paymentMode = 'wallet'
            component.walletBalance = 5
            component.totalPrice = 100
            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
            component.choosePayment()
            expect(openSpy).toHaveBeenCalledWith('INSUFFICIENT_WALLET_BALANCE', 'errorBar')
            expect(setItemSpy).not.toHaveBeenCalledWith('paymentId', 'wallet')
        })

        it('should log and surface error when wallet charge fails in wallet mode', () => {
            const helper = TestBed.inject(SnackBarHelperService)
            const openSpy = vi.spyOn(helper, 'open').mockImplementation(() => {})
            walletService.put.mockReturnValue(throwError({ error: { message: 'Wallet down' } }))
            console.log = vi.fn()
            component.mode = 'wallet'
            component.choosePayment()
            expect(console.log).toHaveBeenCalled()
            expect(openSpy).toHaveBeenCalledWith('Wallet down', 'errorBar')
        })
    })
})
