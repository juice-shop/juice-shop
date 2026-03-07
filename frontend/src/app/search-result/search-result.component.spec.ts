/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { SearchResultComponent } from './search-result.component'
import { ProductService } from '../Services/product.service'
import { ActivatedRoute, provideRouter } from '@angular/router'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
import { MatSnackBar } from '@angular/material/snack-bar'

import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { of, throwError } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { BasketService } from '../Services/basket.service'
import { EventEmitter } from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'
import { QuantityService } from '../Services/quantity.service'
import { DeluxeGuard } from '../app.guard'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

class MockSocket {
  on (str: string, callback: any) {
    callback(str)
  }

  emit () {
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
  let productService: jasmine.SpyObj<ProductService>
  let basketService: jasmine.SpyObj<BasketService>
  let translateService: jasmine.SpyObj<TranslateService>
  let activatedRoute: MockActivatedRoute
  let dialog: jasmine.SpyObj<MatDialog>
  let sanitizer: jasmine.SpyObj<DomSanitizer>
  let socketIoService: jasmine.SpyObj<SocketIoService>
  let mockSocket: MockSocket
  let quantityService: jasmine.SpyObj<QuantityService>
  let deluxeGuard: jasmine.SpyObj<DeluxeGuard>
  let snackBar: jasmine.SpyObj<MatSnackBar>

  beforeEach(waitForAsync(() => {
    dialog = jasmine.createSpyObj('MatDialog', ['open'])
    dialog.open.and.returnValue(null)
    quantityService = jasmine.createSpyObj('QuantityService', ['getAll'])
    quantityService.getAll.and.returnValue(of([]))
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])
    productService = jasmine.createSpyObj('ProductService', ['search', 'get'])
    productService.search.and.returnValue(of([]))
    productService.get.and.returnValue(of({}))
    basketService = jasmine.createSpyObj('BasketService', ['find', 'get', 'put', 'save', 'updateNumberOfCartItems'])
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.get.and.returnValue(of({ quantinty: 1 }))
    basketService.put.and.returnValue(of({ ProductId: 1 }))
    basketService.save.and.returnValue(of({ ProductId: 1 }))
    basketService.updateNumberOfCartItems.and.returnValue(undefined)
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onFallbackLangChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    sanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml', 'sanitize'])
    sanitizer.bypassSecurityTrustHtml.and.returnValue(of({}))
    sanitizer.sanitize.and.returnValue('')
    activatedRoute = new MockActivatedRoute()
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket as unknown as ReturnType<SocketIoService['socket']>)
    deluxeGuard = jasmine.createSpyObj('', ['isDeluxe'])
    deluxeGuard.isDeluxe.and.returnValue(false)

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        RouterTestingModule,
        TranslateModule.forRoot(),
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule,
        MatGridListModule,
        MatCardModule,
        SearchResultComponent],
      providers: [
        provideRouter([]),
        { provide: TranslateService, useValue: translateService },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: BasketService, useValue: basketService },
        { provide: ProductService, useValue: productService },
        { provide: DomSanitizer, useValue: sanitizer },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: SocketIoService, useValue: socketIoService },
        { provide: QuantityService, useValue: quantityService },
        { provide: DeluxeGuard, useValue: deluxeGuard },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
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
    productService.search.and.returnValue(of([{ description: '<script>alert("XSS")</script>' }]))
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<script>alert("XSS")</script>')
  })

  it('should hold no products when product search API call fails', () => {
    productService.search.and.returnValue(throwError(() => 'Error'))
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(component.tableData).toEqual([])
  })

  it('should log error from product search API call directly to browser console', fakeAsync(() => {
    productService.search.and.returnValue(throwError(() => 'Error'))
    console.log = jasmine.createSpy('log')
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should hold no products when quantity getAll API call fails', () => {
    quantityService.getAll.and.returnValue(throwError(() => 'Error'))
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(component.tableData).toEqual([])
  })

  it('should log error from quantity getAll API call directly to browser console', fakeAsync(() => {
    quantityService.getAll.and.returnValue(throwError(() => 'Error'))
    console.log = jasmine.createSpy('log')
    component.ngAfterViewInit()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should notify socket if search query includes DOM XSS payload while filtering table', () => {
    activatedRoute.setQueryParameter('<iframe src="javascript:alert(`xss`)"> Payload')
    spyOn(mockSocket, 'emit')
    component.filterTable()
    expect((mockSocket.emit as jasmine.Spy).calls.mostRecent().args[0]).toBe('verifyLocalXssChallenge')
    expect((mockSocket.emit as jasmine.Spy).calls.mostRecent().args[1]).toBe(activatedRoute.snapshot.queryParams.q)
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
})
