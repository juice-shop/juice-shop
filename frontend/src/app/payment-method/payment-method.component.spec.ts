import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BarRatingModule } from 'ng2-bar-rating'
import { of, throwError } from 'rxjs'
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { PaymentService } from '../Services/payment.service'
import { MatDialogModule } from '@angular/material/dialog'
import { PaymentMethodComponent } from './payment-method.component'

describe('PaymentMethodComponent', () => {
  let component: PaymentMethodComponent
  let fixture: ComponentFixture<PaymentMethodComponent>
  let paymentService

  beforeEach(async(() => {

    paymentService = jasmine.createSpyObj('BasketService', ['save','get','del'])
    paymentService.save.and.returnValue(of([]))
    paymentService.get.and.returnValue(of([]))
    paymentService.del.and.returnValue(of([]))

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
      declarations: [ PaymentMethodComponent ],
      providers: [
        { provide: PaymentService, useValue: paymentService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMethodComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold cards returned by backend API', () => {
    paymentService.get.and.returnValue(of([{ cardNum: '1231123112311231' }, { cardNum: '6454645464546454' }]))
    component.load()
    expect(component.storedCards.length).toBe(2)
    expect(component.storedCards[0].cardNum).toBe('************1231')
    expect(component.storedCards[1].cardNum).toBe('************6454')
  })

  it('should hold no cards on error in backend API', fakeAsync(() => {
    paymentService.get.and.returnValue(throwError('Error'))
    component.load()
    expect(component.storedCards.length).toBe(0)
  }))

  it('should hold no cards when none are returned by backend API', () => {
    paymentService.get.and.returnValue(of([]))
    component.load()
    expect(component.storedCards).toEqual([])
  })

  it('should log error while getting Cards from backend API directly to browser console' , fakeAsync(() => {
    paymentService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.load()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should reinitizalise new payment method form by calling resetForm', () => {
    component.nameControl.setValue('jim')
    component.numberControl.setValue(9999999999999999)
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
    component.numberControl.setValue(99999999999999999)
    expect(component.numberControl.valid).toBeFalsy()
    component.numberControl.setValue(9999999999999999)
    expect(component.numberControl.valid).toBe(true)
    component.numberControl.setValue(1234567887654321)
    expect(component.numberControl.valid).toBe(true)
  })

  it('should reset the form on saving card and show confirmation', () => {
    paymentService.get.and.returnValue(of([]))
    paymentService.save.and.returnValue(of({ cardNum: '1234' }))
    spyOn(component,'resetForm')
    spyOn(component,'load')
    component.save()
    expect(component.confirmation).toBe('Your card ending with 1234 has been saved for your convinience.')
    expect(component.load).toHaveBeenCalled()
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
})
