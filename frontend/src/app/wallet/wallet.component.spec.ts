import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BarRatingModule } from 'ng2-bar-rating'
import { of, throwError } from 'rxjs'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { WalletComponent } from './wallet.component'
import { WalletService } from '../Services/wallet.service'

describe('WalletComponent', () => {
  let component: WalletComponent
  let fixture: ComponentFixture<WalletComponent>
  let walletService

  beforeEach(async(() => {

    walletService = jasmine.createSpyObj('AddressService',['get', 'put'])
    walletService.get.and.returnValue(of({}))
    walletService.put.and.returnValue(of({}))

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,
        BarRatingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatGridListModule
      ],
      declarations: [ WalletComponent],
      providers: [
        { provide: WalletService, useValue: walletService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should be compulsory to provide amount', () => {
    component.balanceControl.setValue('')
    expect(component.balanceControl.valid).toBeFalsy()
  })

  it('amount should be in the range [10, 1000]', () => {
    component.balanceControl.setValue(-1)
    expect(component.balanceControl.valid).toBeFalsy()
    component.balanceControl.setValue(10000000000)
    expect(component.balanceControl.valid).toBeFalsy()
    component.balanceControl.setValue(10)
    expect(component.balanceControl.valid).toBe(true)
    component.balanceControl.setValue(1000)
    expect(component.balanceControl.valid).toBe(true)
  })

  it('should hold balance returned by backend API', () => {
    walletService.get.and.returnValue(of(100))
    component.ngOnInit()
    fixture.detectChanges()
    expect(component.balance).toBe('100.00')
  })

  it('should log error while getting balance from backend API directly to browser console' , fakeAsync(() => {
    walletService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
