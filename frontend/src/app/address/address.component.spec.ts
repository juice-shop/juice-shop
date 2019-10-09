import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
import { AddressComponent } from './address.component'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BarRatingModule } from 'ng2-bar-rating'
import { of, throwError } from 'rxjs'
import { RouterTestingModule } from '@angular/router/testing'
import { AddressService } from '../Services/address.service'
import {
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatRadioModule,
  MatTableModule,
  MatTooltipModule
} from '@angular/material'
import { AddressCreateComponent } from '../address-create/address-create.component'

describe('AddressComponent', () => {
  let component: AddressComponent
  let fixture: ComponentFixture<AddressComponent>
  let addressService

  beforeEach(async(() => {

    addressService = jasmine.createSpyObj('AddressService',['get', 'del'])
    addressService.get.and.returnValue(of([]))
    addressService.del.and.returnValue(of({}))

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
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
        MatDialogModule,
        MatIconModule,
        MatTooltipModule
      ],
      declarations: [ AddressComponent, AddressCreateComponent ],
      providers: [
        { provide: AddressService, useValue: addressService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold no addresses when get API call fails', () => {
    addressService.get.and.returnValue(throwError('Error'))
    component.ngOnInit()
    fixture.detectChanges()
    expect(component.storedAddresses).toEqual([])
  })

  it('should log error from get address API call directly to browser console', fakeAsync(() => {
    addressService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log error from delete address API call directly to browser console', fakeAsync(() => {
    addressService.del.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.deleteAddress(1)
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should delete an address on calling deleteAddress', fakeAsync(() => {
    addressService.get.and.returnValue(of([]))
    addressService.del.and.returnValue(of([]))
    component.deleteAddress(1)
    spyOn(component,'load')
    expect(addressService.del).toHaveBeenCalled()
    expect(addressService.get).toHaveBeenCalled()
  }))
})
