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

import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { MatDialogModule } from '@angular/material/dialog'
import { SavedPaymentMethodsComponent } from './saved-payment-methods.component'
import { PaymentMethodComponent } from '../payment-method/payment-method.component'
import { EventEmitter } from '@angular/core'
import { of } from 'rxjs'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('SavedPaymentMethodsComponent', () => {
    let component: SavedPaymentMethodsComponent
    let translateService
    let fixture: ComponentFixture<SavedPaymentMethodsComponent>
    let snackBar: any

    beforeEach(async () => {
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
                SavedPaymentMethodsComponent, PaymentMethodComponent],
            providers: [
                { provide: TranslateService, useValue: translateService },
                { provide: MatSnackBar, useValue: snackBar },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(SavedPaymentMethodsComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
