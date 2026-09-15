/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { ConfigurationService } from '../Services/configuration.service'
import { UserService } from '../Services/user.service'
import { RecycleService } from '../Services/recycle.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { RecycleComponent } from './recycle.component'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ReactiveFormsModule } from '@angular/forms'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatNativeDateModule } from '@angular/material/core'
import { of, throwError } from 'rxjs'
import { AddressComponent } from '../address/address.component'
import { RouterTestingModule } from '@angular/router/testing'
import { EventEmitter } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatRadioModule } from '@angular/material/radio'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('RecycleComponent', () => {
    let component: RecycleComponent
    let fixture: ComponentFixture<RecycleComponent>
    let recycleService: any
    let userService: any
    let configurationService: any
    let translateService
    let snackBar: any

    beforeEach(async () => {
        recycleService = {
            save: vi.fn().mockName("RecycleService.save"),
            find: vi.fn().mockName("RecycleService.find")
        }
        recycleService.save.mockReturnValue(of({}))
        recycleService.find.mockReturnValue(of([{}]))
        userService = {
            whoAmI: vi.fn().mockName("UserService.whoAmI")
        }
        userService.whoAmI.mockReturnValue(of({}))
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
        snackBar = {
            open: vi.fn().mockName("MatSnackBar.open")
        }

        TestBed.configureTestingModule({
            imports: [RouterTestingModule,
                TranslateModule.forRoot(),
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatCardModule,
                MatCheckboxModule,
                MatDatepickerModule,
                MatNativeDateModule,
                MatIconModule,
                MatToolbarModule,
                MatTableModule,
                MatRadioModule,
                MatTooltipModule,
                MatDialogModule,
                MatDividerModule,
                RecycleComponent, AddressComponent],
            providers: [
                { provide: RecycleService, useValue: recycleService },
                { provide: UserService, useValue: userService },
                { provide: ConfigurationService, useValue: configurationService },
                { provide: TranslateService, useValue: translateService },
                { provide: MatSnackBar, useValue: snackBar },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(RecycleComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should reset the form by calling resetForm', () => {
        component.addressId = '1'
        component.recycleQuantityControl.setValue('100')
        component.pickUpDateControl.setValue('10/7/2018')
        component.pickup.setValue(true)
        component.resetForm()
        expect(component.addressId).toBeUndefined()
        expect(component.recycleQuantityControl.value).toBe('')
        expect(component.recycleQuantityControl.untouched).toBe(true)
        expect(component.recycleQuantityControl.pristine).toBe(true)
        expect(component.pickUpDateControl.value).toBe('')
        expect(component.pickUpDateControl.untouched).toBe(true)
        expect(component.pickUpDateControl.pristine).toBe(true)
        expect(component.pickup.value).toBe(false)
    })

    it('should hold the user id of the currently logged in user', () => {
        userService.whoAmI.mockReturnValue(of({ id: 42 }))
        component.ngOnInit()
        expect(component.recycle.UserId).toBe(42)
    })

    it('should hold no email if current user is not logged in', () => {
        userService.whoAmI.mockReturnValue(of({}))
        component.ngOnInit()
        expect(component.userEmail).toBeUndefined()
    })

    it('should hold the user email of the currently logged in user', () => {
        userService.whoAmI.mockReturnValue(of({ email: 'x@x.xx' }))
        component.ngOnInit()
        expect(component.userEmail).toBe('x@x.xx')
    })

    it('should display pickup message and reset recycle form on saving', () => {
        recycleService.save.mockReturnValue(of({}))
        userService.whoAmI.mockReturnValue(of({}))
        translateService.get.mockReturnValue(of('CONFIRM_RECYCLING_BOX'))
        vi.spyOn(component, 'initRecycle')
        vi.spyOn(component.addressComponent, 'load')
        component.addressId = '1'
        component.recycleQuantityControl.setValue(100)
        component.pickup.setValue(false)
        const recycle = { UserId: undefined, AddressId: '1', quantity: 100 }
        component.save()
        expect(vi.mocked(recycleService.save).mock.calls.length).toBe(1)
        expect(vi.mocked(recycleService.save).mock.calls[0][0]).toEqual(recycle)
        expect(component.initRecycle).toHaveBeenCalled()
        expect(component.addressComponent.load).toHaveBeenCalled()
        expect(translateService.get).toHaveBeenCalledWith('CONFIRM_RECYCLING_BOX')
    })

    it('should display pickup message and reset recycle form on saving when pickup is selected', () => {
        recycleService.save.mockReturnValue(of({ isPickup: true, pickupDate: '10/7/2018' }))
        userService.whoAmI.mockReturnValue(of({}))
        translateService.get.mockReturnValue(of('CONFIRM_RECYCLING_PICKUP'))
        vi.spyOn(component, 'initRecycle')
        vi.spyOn(component.addressComponent, 'load')
        component.addressId = '1'
        component.recycleQuantityControl.setValue(100)
        component.pickup.setValue(true)
        component.pickUpDateControl.setValue('10/7/2018')
        const recycle = { isPickUp: true, date: '10/7/2018', UserId: undefined, AddressId: '1', quantity: 100 }
        component.save()
        expect(vi.mocked(recycleService.save).mock.calls.length).toBe(1)
        expect(vi.mocked(recycleService.save).mock.calls[0][0]).toEqual(recycle)
        expect(component.initRecycle).toHaveBeenCalled()
        expect(component.addressComponent.load).toHaveBeenCalled()
        expect(translateService.get).toHaveBeenCalledWith('CONFIRM_RECYCLING_PICKUP', { pickupdate: '10/7/2018' })
    })

    it('should hold existing recycles', () => {
        recycleService.find.mockReturnValue(of([{ quantity: 1 }, { quantity: 2 }]))
        component.ngOnInit()
        expect(component.recycles.length).toBe(2)
        expect(component.recycles[0].quantity).toBe(1)
        expect(component.recycles[1].quantity).toBe(2)
    })

    it('should hold nothing when no recycles exists', () => {
        recycleService.find.mockReturnValue(of([]))
        component.ngOnInit()
        expect(component.recycles.length).toBe(0)
    })

    it('should hold nothing on error from backend API', () => {
        recycleService.find.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log the error on retrieving the user', () => {
        userService.whoAmI.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should use a configured product image on top of page', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { recyclePage: { topProductImage: 'top.png' } } }))
        component.ngOnInit()
        expect(component.topImage).toEqual('assets/public/images/products/top.png')
    })

    it('should use a configured product image on bottom of page', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { recyclePage: { topProductImage: 'bottom.png' } } }))
        component.ngOnInit()
        expect(component.topImage).toEqual('assets/public/images/products/bottom.png')
    })

    it('should show broken top and bottom image on error retrieving configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
        component.ngOnInit()
        expect(component.topImage).toBeUndefined()
        expect(component.bottomImage).toBeUndefined()
    })
})
