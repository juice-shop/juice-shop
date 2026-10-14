/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDialogModule } from '@angular/material/dialog'
import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { BasketComponent } from './basket.component'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { RouterTestingModule } from '@angular/router/testing'
import { PurchaseBasketComponent } from '../purchase-basket/purchase-basket.component'
import { DeluxeGuard } from '../app.guard'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { Router } from '@angular/router'

describe('BasketComponent', () => {
    let component: BasketComponent
    let fixture: ComponentFixture<BasketComponent>
    let deluxeGuard
    let snackBar: any

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule,
                TranslateModule.forRoot(),
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatCardModule,
                MatTableModule,
                MatButtonModule,
                MatExpansionModule,
                MatDialogModule,
                MatButtonToggleModule,
                MatSnackBarModule,
                BasketComponent, PurchaseBasketComponent],
            providers: [
                { provide: DeluxeGuard, useValue: deluxeGuard },
                { provide: MatSnackBar, useValue: snackBar },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(BasketComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should store product count on calling getProductCount', () => {
        component.getProductCount(1)
        expect(component.productCount).toBe(1)
    })

    it('should store bonus points on calling getBonusPoints', () => {
        component.getBonusPoints([1, 10])
        expect(component.bonus).toBe(10)
    })

    it('should store itemTotal in session storage', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        component.getBonusPoints([1, 10])
        expect(setItemSpy).toHaveBeenCalledWith('itemTotal', '1')
    })

    describe('template rendering', () => {
        it('should render the purchase basket child component and the checkout button', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('app-purchase-basket')).toBeTruthy()
            expect(compiled.querySelector('button#checkoutButton')).toBeTruthy()
        })

        it('should disable the checkout button when the productCount is less than 1', () => {
            component.productCount = 0
            fixture.detectChanges()
            const btn = (fixture.nativeElement as HTMLElement).querySelector('button#checkoutButton') as HTMLButtonElement
            expect(btn.disabled).toBe(true)
        })

        it('should enable the checkout button as soon as the productCount is at least 1', () => {
            component.productCount = 1
            fixture.detectChanges()
            const btn = (fixture.nativeElement as HTMLElement).querySelector('button#checkoutButton') as HTMLButtonElement
            expect(btn.disabled).toBe(false)
        })

        it('should invoke checkout when the checkout button is clicked', () => {
            component.productCount = 1
            fixture.detectChanges()
            const spy = vi.spyOn(component, 'checkout').mockImplementation(() => { })
            const btn = (fixture.nativeElement as HTMLElement).querySelector('button#checkoutButton') as HTMLButtonElement
            btn.click()
            expect(spy).toHaveBeenCalled()
        })

        it('should render the bonus-points hint below the checkout button', () => {
            const hint = (fixture.nativeElement as HTMLElement).querySelector('.hint')
            expect(hint).toBeTruthy()
        })
    })

    describe('checkout', () => {
        it('should redirect to the login page with the basket as redirect target when no auth token is stored', async () => {
            const router = TestBed.inject(Router)
            const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
            vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
            component.checkout()
            await Promise.resolve()
            expect(navSpy).toHaveBeenCalledWith(['/login'], { queryParams: { redirectUrl: '/basket' } })
        })

        it('should navigate to the address selection page when an auth token is stored', async () => {
            const router = TestBed.inject(Router)
            const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
            vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('valid-token')
            component.checkout()
            await Promise.resolve()
            expect(navSpy).toHaveBeenCalledWith(['/address/select'])
        })
    })
})
