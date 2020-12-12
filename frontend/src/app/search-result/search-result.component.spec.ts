/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing'
import { SearchResultComponent } from './search-result.component'
import { ProductService } from '../Services/product.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { of } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { throwError } from 'rxjs/internal/observable/throwError'
import { ProductDetailsComponent } from 'src/app/product-details/product-details.component'
import { BasketService } from '../Services/basket.service'
import { EventEmitter } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { SocketIoService } from '../Services/socket-io.service'
import { Product } from '../Models/product.model'
import { QuantityService } from '../Services/quantity.service'
import { DeluxeGuard } from '../app.guard'

class MockSocket {
  on (str: string, callback: Function) {
    callback(str)
  }

  emit (a: any, b: any) {
    return null
  }
}

class MockActivatedRoute {
  snapshot = { queryParams: { q: '' } }

  setQueryParameter (arg: string) {
    this.snapshot.queryParams.q = arg
  }
}

describe('SearchResultComponent', () => {
  let component: SearchResultComponent
  let fixture: ComponentFixture<SearchResultComponent>
  let productService: any
  let basketService: any
  let translateService: any
  let activatedRoute: MockActivatedRoute
  let dialog: any
  let sanitizer: any
  let socketIoService: any
  let mockSocket: any
  let quantityService
  let deluxeGuard
  let snackBar: any

  beforeEach(async(() => {

    dialog = jasmine.createSpyObj('MatDialog',['open'])
    dialog.open.and.returnValue(null)
    quantityService = jasmine.createSpyObj('QuantityService', ['getAll'])
    quantityService.getAll.and.returnValue(of([]))
    snackBar = jasmine.createSpyObj('MatSnackBar',['open'])
    productService = jasmine.createSpyObj('ProductService', ['search','get'])
    productService.search.and.returnValue(of([]))
    productService.get.and.returnValue(of({}))
    basketService = jasmine.createSpyObj('BasketService', ['find','get','put','save','updateNumberOfCartItems'])
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.get.and.returnValue(of({ quantinty: 1 }))
    basketService.put.and.returnValue(of({ ProductId: 1 }))
    basketService.save.and.returnValue(of({ ProductId: 1 }))
    basketService.updateNumberOfCartItems.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    sanitizer = jasmine.createSpyObj('DomSanitizer',['bypassSecurityTrustHtml', 'sanitize'])
    sanitizer.bypassSecurityTrustHtml.and.returnValue(of({}))
    sanitizer.sanitize.and.returnValue({})
    activatedRoute = new MockActivatedRoute()
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)
    deluxeGuard = jasmine.createSpyObj('',['isDeluxe'])
    deluxeGuard.isDeluxe.and.returnValue(of(false))

    TestBed.configureTestingModule({
      declarations: [ SearchResultComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule,
        MatGridListModule,
        MatCardModule
      ],
      providers: [
        { provide: TranslateService, useValue: translateService },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: BasketService, useValue: basketService },
        { provide: ProductService, useValue: productService },
        { provide: DomSanitizer, useValue: sanitizer },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: SocketIoService, useValue: socketIoService },
        { provide: QuantityService, useValue: quantityService },
        { provide: DeluxeGuard, useValue: deluxeGuard }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultComponent)
    component = fixture.componentInstance
    component.ngAfterViewInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should render product descriptions as trusted HTML', () => {
    productService.search.and.returnValue(of([ { description: '<script>alert("XSS")</script>' } ]))
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<script>alert("XSS")</script>')
  })

  it('should hold no products when product search API call fails', () => {
    productService.search.and.returnValue(throwError('Error'))
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(component.tableData).toEqual([])
  })

  it('should log error from product search API call directly to browser console', fakeAsync(() => {
    productService.search.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should hold no products when quantity getAll API call fails', () => {
    quantityService.getAll.and.returnValue(throwError('Error'))
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(component.tableData).toEqual([])
  })

  it('should log error from quantity getAll API call directly to browser console', fakeAsync(() => {
    quantityService.getAll.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should notify socket if search query includes DOM XSS payload while filtering table', () => {
    activatedRoute.setQueryParameter('<iframe src="javascript:alert(`xss`)"> Payload')
    spyOn(mockSocket,'emit')
    component.filterTable()
    expect(mockSocket.emit.calls.mostRecent().args[0]).toBe('verifyLocalXssChallenge')
    expect(mockSocket.emit.calls.mostRecent().args[1]).toBe(activatedRoute.snapshot.queryParams.q)
  })

  it('should trim the queryparameter while filtering the datasource', () => {
    activatedRoute.setQueryParameter('  Product Search   ')
    component.filterTable()
    expect(component.dataSource.filter).toEqual('product search')
  })

  it('should pass the search query as trusted HTML', () => {
    activatedRoute.setQueryParameter('<script>scripttag</script>')
    component.filterTable()
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<script>scripttag</script>')
  })

  it('should open a modal dialog with product details', () => {
    component.showDetail({ id: 42 } as Product)
    expect(dialog.open).toHaveBeenCalledWith(ProductDetailsComponent, {
      width: '500px',
      height: 'max-content',
      data: {
        productData: { id: 42 }
      }
    })
  })

  it('should add new product to basket', () => {
    basketService.find.and.returnValue(of({ Products: [] }))
    productService.search.and.returnValue(of([]))
    basketService.save.and.returnValue(of({ ProductId: 1 }))
    productService.get.and.returnValue(of({ name: 'Cherry Juice' }))
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(1)
    expect(basketService.find).toHaveBeenCalled()
    expect(basketService.save).toHaveBeenCalled()
    expect(productService.get).toHaveBeenCalled()
    expect(translateService.get).toHaveBeenCalledWith('BASKET_ADD_PRODUCT', { product: 'Cherry Juice' })
  })

  it('should translate BASKET_ADD_PRODUCT message', () => {
    basketService.find.and.returnValue(of({ Products: [] }))
    productService.search.and.returnValue(of([]))
    basketService.save.and.returnValue(of({ ProductId: 1 }))
    productService.get.and.returnValue(of({ name: 'Cherry Juice' }))
    translateService.get.and.returnValue(of('Translation of BASKET_ADD_PRODUCT'))
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(1)
    expect(basketService.find).toHaveBeenCalled()
    expect(basketService.save).toHaveBeenCalled()
    expect(productService.get).toHaveBeenCalled()
    expect(snackBar.open).toHaveBeenCalled()
  })

  it('should add similar product to basket', () => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.get.and.returnValue(of({ id: 42, quantity: 5 }))
    basketService.put.and.returnValue(of({ ProductId: 2 }))
    productService.get.and.returnValue(of({ name: 'Tomato Juice' }))
    translateService.get.and.returnValue(of(undefined))
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(basketService.find).toHaveBeenCalled()
    expect(basketService.get).toHaveBeenCalled()
    expect(basketService.put).toHaveBeenCalled()
    expect(productService.get).toHaveBeenCalled()
    expect(translateService.get).toHaveBeenCalledWith('BASKET_ADD_SAME_PRODUCT', { product: 'Tomato Juice' })
  })

  it('should translate BASKET_ADD_SAME_PRODUCT message', () => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.get.and.returnValue(of({ id: 42, quantity: 5 }))
    basketService.put.and.returnValue(of({ ProductId: 2 }))
    productService.get.and.returnValue(of({ name: 'Tomato Juice' }))
    translateService.get.and.returnValue(of('Translation of BASKET_ADD_SAME_PRODUCT'))
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(basketService.find).toHaveBeenCalled()
    expect(basketService.get).toHaveBeenCalled()
    expect(basketService.put).toHaveBeenCalled()
    expect(productService.get).toHaveBeenCalled()
  })

  it('should not add anything to basket on error retrieving basket', fakeAsync(() => {
    basketService.find.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','815')
    component.addToBasket(undefined)
    expect(snackBar.open).not.toHaveBeenCalled()
  }))

  it('should log errors retrieving basket directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','815')
    console.log = jasmine.createSpy('log')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should not add anything to basket on error retrieving existing basket item', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.get.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(snackBar.open).not.toHaveBeenCalled()
  }))

  it('should log errors retrieving basket item directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.get.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','4711')
    console.log = jasmine.createSpy('log')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log errors updating basket directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.put.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','4711')
    console.log = jasmine.createSpy('log')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should not add anything to basket on error retrieving product associated with basket item', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    productService.get.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(snackBar.open).not.toHaveBeenCalled()
  }))

  it('should log errors retrieving product associated with basket item directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    productService.get.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','4711')
    console.log = jasmine.createSpy('log')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should not add anything on error creating new basket item', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.save.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(snackBar.open).toHaveBeenCalled()
  }))

  it('should log errors creating new basket item directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.save.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(snackBar.open).toHaveBeenCalled()
  }))

  it('should not add anything on error retrieving product after creating new basket item', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [] }))
    productService.get.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(snackBar.open).not.toHaveBeenCalled()
  }))

  it('should log errors retrieving product after creating new basket item directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [] }))
    productService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
