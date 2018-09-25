import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { HttpClientModule } from '@angular/common/http'
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'
import { SearchResultComponent } from './search-result.component'
import { ProductService } from './../Services/product.service'
import { RouterTestingModule } from '@angular/router/testing'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { of } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { throwError } from 'rxjs/internal/observable/throwError'
import { ProductDetailsComponent } from 'src/app/product-details/product-details.component'
import { BasketService } from './../Services/basket.service'
import { EventEmitter } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Socket } from 'ng6-socket-io'

class MockSocket {
  on (str: string, callback) {
    callback(str)
  }

  emit (a,b) {
    return null
  }
}

class MockActivatedRoute {
  snapshot = { queryParams: { q: '' } }

  setQueryParameter (arg) {
    this.snapshot.queryParams.q = arg
  }
}

describe('SearchResultComponent', () => {
  let component: SearchResultComponent
  let fixture: ComponentFixture<SearchResultComponent>
  let productService
  let basketService
  let translateService
  let activatedRoute: MockActivatedRoute
  let dialog
  let sanitizer
  let mockSocket

  beforeEach(async(() => {

    dialog = jasmine.createSpyObj('MatDialog',['open'])
    dialog.open.and.returnValue(null)
    productService = jasmine.createSpyObj('ProductService', ['search','get'])
    productService.search.and.returnValue(of([]))
    productService.get.and.returnValue(of({}))
    basketService = jasmine.createSpyObj('BasketService', ['find','get','put','save'])
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.get.and.returnValue(of({ quantinty: 1 }))
    basketService.put.and.returnValue(of({ ProductId: 1 }))
    basketService.save.and.returnValue(of({ ProductId: 1 }))
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

    TestBed.configureTestingModule({
      declarations: [ SearchResultComponent ],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule
      ],
      providers: [
        { provide: TranslateService, useValue: translateService },
        { provide: MatDialog, useValue: dialog },
        { provide: BasketService, useValue: basketService },
        { provide: ProductService, useValue: productService },
        { provide: DomSanitizer, useValue: sanitizer },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Socket, useValue: mockSocket }
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

  it('should notify socket if search query includes XSS Tier 1 payload while filtering table', () => {
    activatedRoute.setQueryParameter('<iframe src="javascript:alert(`xss`)"> Payload')
    spyOn(mockSocket,'emit')
    component.filterTable()
    expect(mockSocket.emit.calls.mostRecent().args[0]).toBe('localXSSChallengeSolved')
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
    component.showDetail(42)
    expect(dialog.open).toHaveBeenCalledWith(ProductDetailsComponent, {
      width: '500px',
      height: 'max-content',
      data: {
        productData: 42
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
    expect(translateService.get.calls.mostRecent().args[0]).toBe('BASKET_ADD_PRODUCT')
    expect(translateService.get.calls.mostRecent().args[1]).toEqual({ product: 'Cherry Juice' })
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
    expect(component.confirmation).toBe('Translation of BASKET_ADD_PRODUCT')
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
    expect(translateService.get.calls.mostRecent().args[0]).toBe('BASKET_ADD_SAME_PRODUCT')
    expect(translateService.get.calls.mostRecent().args[1]).toEqual({ product: 'Tomato Juice' })
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
    expect(component.confirmation).toBe('Translation of BASKET_ADD_SAME_PRODUCT')
  })

  it('should not add anything to basket on error retrieving basket', fakeAsync(() => {
    basketService.find.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','815')
    component.addToBasket(null)
    expect(component.confirmation).toBeUndefined()
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
    expect(component.confirmation).toBeUndefined()
  }))

  it('should log errors retrieving basket item directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.get.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','4711')
    console.log = jasmine.createSpy('log')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should not add anything to basket on error updating basket item', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.put.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(component.confirmation).toBeUndefined()
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
    expect(component.confirmation).toBeUndefined()
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
    expect(component.confirmation).toBeUndefined()
  }))

  it('should log errors creating new basket item directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.save.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should not add anything on error retrieving product after creating new basket item', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [] }))
    productService.get.and.returnValue(throwError('Error'))
    sessionStorage.setItem('bid','4711')
    component.addToBasket(2)
    expect(component.confirmation).toBeUndefined()
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
