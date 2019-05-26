import { TranslateModule } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
import { AccountingComponent } from './accounting.component'
import { ProductService } from '../Services/product.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { of } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { QuantityService } from '../Services/quantity.service'
import { MatFormFieldModule } from '@angular/material/form-field'
import { throwError } from 'rxjs/internal/observable/throwError'

describe('AccountingComponent', () => {
  let component: AccountingComponent
  let fixture: ComponentFixture<AccountingComponent>
  let productService
  let quantityService
  let sanitizer

  beforeEach(async(() => {
    quantityService = jasmine.createSpyObj('QuantityService', ['getAll', 'get', 'put'])
    quantityService.getAll.and.returnValue(of([]))
    quantityService.get.and.returnValue(of({}))
    quantityService.put.and.returnValue(of({}))
    productService = jasmine.createSpyObj('ProductService', ['search', 'get', 'put'])
    productService.search.and.returnValue(of([]))
    productService.get.and.returnValue(of({}))
    productService.put.and.returnValue(of({}))

    TestBed.configureTestingModule({
      declarations: [ AccountingComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatDividerModule,
        MatGridListModule,
        MatCardModule
      ],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: QuantityService, useValue: quantityService },
        { provide: DomSanitizer, useValue: sanitizer }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingComponent)
    component = fixture.componentInstance
    component.ngAfterViewInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load products and quantitites when initiated', () => {
    quantityService.getAll.and.returnValue(of([]))
    productService.search.and.returnValue(of([]))
    component.ngAfterViewInit()
    expect(quantityService.getAll).toHaveBeenCalled()
    expect(productService.search).toHaveBeenCalled()
  })

  it('should hold no products when product search API call fails', () => {
    productService.search.and.returnValue(throwError('Error'))
    component.loadProducts()
    fixture.detectChanges()
    expect(component.tableData).toEqual([])
  })

  it('should hold no quantities when getAll quanitity API call fails', () => {
    quantityService.getAll.and.returnValue(throwError('Error'))
    component.loadQuantity()
    fixture.detectChanges()
    expect(component.quantityMap).toEqual({})
  })

  it('should log error from product search API call directly to browser console', fakeAsync(() => {
    productService.search.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.loadProducts()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log error from getAll quantity API call directly to browser console', fakeAsync(() => {
    quantityService.getAll.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.loadQuantity()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log and display errors while modifying price', fakeAsync(() => {
    productService.put.and.returnValue(throwError({ error: 'Error' }))
    console.log = jasmine.createSpy('log')
    component.modifyPrice(1, 100)
    fixture.detectChanges()
    expect(component.error).toBe('Error')
    expect(component.confirmation).toBe(null)
    expect(console.log).toHaveBeenCalledWith({ error: 'Error' })
  }))

  it('should log and display errors while increasing quantity', fakeAsync(() => {
    quantityService.put.and.returnValue(throwError({ error: 'Error' }))
    console.log = jasmine.createSpy('log')
    component.inc(1)
    fixture.detectChanges()
    expect(component.error).toBe('Error')
    expect(component.confirmation).toBe(null)
    expect(console.log).toHaveBeenCalledWith({ error: 'Error' })
  }))

  it('should log and display errors while decreasing quantity', fakeAsync(() => {
    quantityService.put.and.returnValue(throwError({ error: 'Error' }))
    console.log = jasmine.createSpy('log')
    component.dec(1)
    fixture.detectChanges()
    expect(component.error).toBe('Error')
    expect(component.confirmation).toBe(null)
    expect(console.log).toHaveBeenCalledWith({ error: 'Error' })
  }))

  it('should show confirmation on increasing quantity of a product', fakeAsync(() => {
    component.inc(1)
    fixture.detectChanges()
    expect(component.confirmation).toBe('Quantity has been updated')
  }))

  it('should show confirmation on decreasing quantity of a product', fakeAsync(() => {
    component.inc(1)
    fixture.detectChanges()
    expect(component.confirmation).toBe('Quantity has been updated')
  }))

  it('should show confirmation on modifying price of a product', fakeAsync(() => {
    component.modifyPrice(1, 100)
    fixture.detectChanges()
    expect(component.confirmation).toBe('Price has been updated')
  }))

  it('should increase quantity of a product', () => {
    quantityService.get.and.returnValue(of({ quantity: 10 }))
    quantityService.put.and.returnValue(of({}))
    quantityService.getAll.and.returnValue(of([]))
    component.inc(1)
    expect(quantityService.get).toHaveBeenCalled()
    expect(quantityService.put).toHaveBeenCalled()
    expect(quantityService.getAll).toHaveBeenCalled()
  })

  it('should decreases quantity of a product', () => {
    quantityService.get.and.returnValue(of({ quantity: 10 }))
    quantityService.put.and.returnValue(of({}))
    quantityService.getAll.and.returnValue(of([]))
    component.dec(1)
    expect(quantityService.get).toHaveBeenCalled()
    expect(quantityService.put).toHaveBeenCalled()
    expect(quantityService.getAll).toHaveBeenCalled()
  })

  it('should modify price of a product', () => {
    productService.put.and.returnValue(of({}))
    productService.search.and.returnValue(of([]))
    component.modifyPrice(1, 100)
    expect(productService.put).toHaveBeenCalled()
    expect(productService.search).toHaveBeenCalled()
  })
})
