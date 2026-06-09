/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'

import { of, throwError } from 'rxjs'
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { PaymentService } from '../Services/payment.service'
import { MatDialogModule } from '@angular/material/dialog'
import { PaymentMethodComponent } from './payment-method.component'
import { EventEmitter } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('PaymentMethodComponent', () => {
    let component: PaymentMethodComponent
    let fixture: ComponentFixture<PaymentMethodComponent>
    let paymentService
    let translateService
    let snackBar: any

    beforeEach(async () => {
        paymentService = {
            save: vi.fn().mockName("BasketService.save"),
            get: vi.fn().mockName("BasketService.get"),
            del: vi.fn().mockName("BasketService.del")
        }
        paymentService.save.mockReturnValue(of([]))
        paymentService.get.mockReturnValue(of([]))
        paymentService.del.mockReturnValue(of([]))
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
            imports: [TranslateModule.forRoot(),
                ReactiveFormsModule,
                MatCardModule,
                MatTableModule,
                MatFormFieldModule,
                MatInputModule,
                MatExpansionModule,
                MatDividerModule,
                MatRadioModule,
                MatDialogModule,
                PaymentMethodComponent],
            providers: [
                { provide: PaymentService, useValue: paymentService },
                { provide: TranslateService, useValue: translateService },
                { provide: MatSnackBar, useValue: snackBar },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(PaymentMethodComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should hold cards returned by backend API', () => {
        paymentService.get.mockReturnValue(of([{ cardNum: '************1231' }, { cardNum: '************6454' }]))
        component.load()
        expect(component.storedCards.length).toBe(2)
        expect(component.storedCards[0].cardNum).toBe('************1231')
        expect(component.storedCards[1].cardNum).toBe('************6454')
    })

    it('should hold no cards on error in backend API', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        paymentService.get.mockReturnValue(throwError('Error'))
        component.load()
        expect(component.storedCards.length).toBe(0)
    })

    it('should hold no cards when none are returned by backend API', () => {
        paymentService.get.mockReturnValue(of([]))
        component.load()
        expect(component.storedCards).toEqual([])
    })

    it('should log error while getting Cards from backend API directly to browser console', () => {
        paymentService.get.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.load()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should reinitizalise new payment method form by calling resetForm', () => {
        component.nameControl.setValue('jim')
        component.numberControl.setValue(1234567887654321)
        component.monthControl.setValue(12)
        component.yearControl.setValue(2085)
        component.resetForm()
        expect(component.nameControl.value).toBe('')
        expect(component.nameControl.pristine).toBe(true)
        expect(component.nameControl.untouched).toBe(true)
        expect(component.numberControl.value).toBe('')
        expect(component.numberControl.pristine).toBe(true)
        expect(component.numberControl.untouched).toBe(true)
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

        // eslint-disable-next-line no-loss-of-precision
        component.numberControl.setValue(99999999999999999)
        expect(component.numberControl.valid).toBeFalsy()

        // eslint-disable-next-line no-loss-of-precision
        component.numberControl.setValue(9999999999999999)
        expect(component.numberControl.valid).toBe(true)
        component.numberControl.setValue(1234567887654321)
        expect(component.numberControl.valid).toBe(true)
    })

    it('should reset the form on saving card and show confirmation', () => {
        paymentService.get.mockReturnValue(of([]))
        paymentService.save.mockReturnValue(of({ cardNum: '1234' }))
        translateService.get.mockReturnValue(of('CREDIT_CARD_SAVED'))
        vi.spyOn(component, 'resetForm')
        vi.spyOn(component, 'load')
        component.save()
        expect(translateService.get).toHaveBeenCalledWith('CREDIT_CARD_SAVED', { cardnumber: '1234' })
        expect(component.load).toHaveBeenCalled()
        expect(component.resetForm).toHaveBeenCalled()
    })

    it('should clear the form and display error if saving card fails', () => {
        paymentService.save.mockReturnValue(throwError({ error: 'Error' }))
        vi.spyOn(component, 'resetForm')
        component.save()
        expect(snackBar.open).toHaveBeenCalled()
        expect(component.resetForm).toHaveBeenCalled()
    })

    it('should still open a snack bar when the CREDIT_CARD_SAVED translation fails', () => {
        paymentService.save.mockReturnValue(of({ cardNum: '1234' }))
        // First call (CREDIT_CARD_SAVED lookup) fails, subsequent translations succeed.
        translateService.get.mockReturnValueOnce(throwError(() => 'CREDIT_CARD_SAVED'))
        translateService.get.mockReturnValue(of('translated'))
        component.save()
        expect(snackBar.open).toHaveBeenCalled()
    })

    describe('delete card', () => {
        it('should reload the card list after the card is deleted', () => {
            const loadSpy = vi.spyOn(component, 'load')
            paymentService.del.mockReturnValue(of({}))
            component.delete(42)
            expect(paymentService.del).toHaveBeenCalledWith(42)
            expect(loadSpy).toHaveBeenCalled()
        })

        it('should log the error to the browser console when the card cannot be deleted', () => {
            paymentService.del.mockReturnValue(throwError(() => 'DelError'))
            console.log = vi.fn()
            component.delete(42)
            expect(console.log).toHaveBeenCalledWith('DelError')
        })
    })

    describe('emitSelectionToParent', () => {
        it('should emit the selected card id via the emitSelection output', () => {
            const spy = vi.fn()
            component.emitSelection.subscribe(spy)
            component.emitSelectionToParent(7)
            expect(spy).toHaveBeenCalledWith(7)
        })
    })

    describe('column selection by allowDelete', () => {
        function createWithDelete(allowDelete: boolean): PaymentMethodComponent {
            const f = TestBed.createComponent(PaymentMethodComponent)
            f.componentInstance.allowDelete = allowDelete
            f.detectChanges()
            return f.componentInstance
        }

        it('should expose a Remove column when allowDelete is true', () => {
            const c = createWithDelete(true)
            expect(c.displayedColumns).toContain('Remove')
            expect(c.displayedColumns).not.toContain('Selection')
        })

        it('should expose a Selection column when allowDelete is false', () => {
            const c = createWithDelete(false)
            expect(c.displayedColumns).toContain('Selection')
            expect(c.displayedColumns).not.toContain('Remove')
        })
    })

    describe('template rendering', () => {
        function renderWithCards(cards: any[], allowDelete = false): void {
            paymentService.get.mockReturnValue(of(cards))
            component.allowDelete = allowDelete
            component.ngOnInit()
            fixture.detectChanges()
        }

        it('should not render the cards table when no cards exist', () => {
            renderWithCards([])
            expect((fixture.nativeElement as HTMLElement).querySelector('mat-table')).toBeNull()
        })

        it('should render a row for each stored card with its details', () => {
            renderWithCards([
                { id: 1, cardNum: '************1111', fullName: 'Alice', expMonth: 5, expYear: 2090 },
                { id: 2, cardNum: '************2222', fullName: 'Bob', expMonth: 6, expYear: 2091 }
            ])
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelectorAll('mat-row').length).toBe(2)
            expect(compiled.textContent).toContain('************1111')
            expect(compiled.textContent).toContain('Alice')
            expect(compiled.textContent).toContain('5/2090')
        })

        it('should render a remove button when allowDelete is true and trigger delete on click', () => {
            renderWithCards([{ id: 9, cardNum: '************9999', fullName: 'Carol', expMonth: 1, expYear: 2080 }], true)
            const compiled: HTMLElement = fixture.nativeElement
            const removeBtn = compiled.querySelector('.fa-trash-alt')?.closest('button') as HTMLButtonElement
            expect(removeBtn).toBeTruthy()
            const deleteSpy = vi.spyOn(component, 'delete').mockImplementation(() => { })
            removeBtn.click()
            expect(deleteSpy).toHaveBeenCalledWith(9)
        })

        it('should render a radio selection when allowDelete is false and emit the selected id on click', () => {
            renderWithCards([{ id: 5, cardNum: '************5555', fullName: 'Eve', expMonth: 2, expYear: 2085 }], false)
            const compiled: HTMLElement = fixture.nativeElement
            const radio = compiled.querySelector('mat-radio-button') as HTMLElement
            expect(radio).toBeTruthy()
            const spy = vi.fn()
            component.emitSelection.subscribe(spy)
            radio.click()
            expect(spy).toHaveBeenCalledWith(5)
        })

        it('should disable the submit button until all controls are valid', () => {
            const submit = (fixture.nativeElement as HTMLElement).querySelector('#submitButton') as HTMLButtonElement
            expect(submit.disabled).toBe(true)
            component.nameControl.setValue('John Doe')
            component.numberControl.setValue(1234567887654321)
            component.monthControl.setValue(5)
            component.yearControl.setValue(2090)
            fixture.detectChanges()
            expect(submit.disabled).toBe(false)
        })
    })
})
