/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
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

if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
        observe () {}
        unobserve () {}
        disconnect () {}
    } as any
}

class MockSocket {
    on(str: string, callback: any) {
        callback(str)
    }

    emit() {
        return null
    }
}

class MockActivatedRoute {
    snapshot = { queryParams: { q: '' } }

    setQueryParameter(arg: string) {
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
    let mockSocket: MockSocket
    let quantityService: any
    let deluxeGuard: any
    let snackBar: any

    beforeEach(async () => {
        dialog = {
            open: vi.fn().mockName("MatDialog.open")
        }
        dialog.open.mockReturnValue(null)
        quantityService = {
            getAll: vi.fn().mockName("QuantityService.getAll")
        }
        quantityService.getAll.mockReturnValue(of([]))
        snackBar = {
            open: vi.fn().mockName("MatSnackBar.open")
        }
        productService = {
            search: vi.fn().mockName("ProductService.search"),
            get: vi.fn().mockName("ProductService.get")
        }
        productService.search.mockReturnValue(of([]))
        productService.get.mockReturnValue(of({}))
        basketService = {
            find: vi.fn().mockName("BasketService.find"),
            get: vi.fn().mockName("BasketService.get"),
            put: vi.fn().mockName("BasketService.put"),
            save: vi.fn().mockName("BasketService.save"),
            updateNumberOfCartItems: vi.fn().mockName("BasketService.updateNumberOfCartItems")
        }
        basketService.find.mockReturnValue(of({ Products: [] }))
        basketService.get.mockReturnValue(of({ quantinty: 1 }))
        basketService.put.mockReturnValue(of({ ProductId: 1 }))
        basketService.save.mockReturnValue(of({ ProductId: 1 }))
        basketService.updateNumberOfCartItems.mockReturnValue(undefined)
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        Object.defineProperty(translateService, 'onLangChange', { value: new EventEmitter() })
        Object.defineProperty(translateService, 'onTranslationChange', { value: new EventEmitter() })
        Object.defineProperty(translateService, 'onFallbackLangChange', { value: new EventEmitter() })
        Object.defineProperty(translateService, 'onDefaultLangChange', { value: new EventEmitter() })
        sanitizer = {
            bypassSecurityTrustHtml: vi.fn().mockName("DomSanitizer.bypassSecurityTrustHtml"),
            sanitize: vi.fn().mockName("DomSanitizer.sanitize")
        }
        sanitizer.bypassSecurityTrustHtml.mockReturnValue(of({}))
        sanitizer.sanitize.mockReturnValue('')
        activatedRoute = new MockActivatedRoute()
        mockSocket = new MockSocket()
        socketIoService = {
            socket: vi.fn().mockName("SocketIoService.socket")
        }
        socketIoService.socket.mockReturnValue(mockSocket as unknown as ReturnType<SocketIoService['socket']>)
        deluxeGuard = {
            isDeluxe: vi.fn()
        }
        deluxeGuard.isDeluxe.mockReturnValue(false)

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
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
    })

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
        productService.search.mockReturnValue(of([{ description: '<script>alert("XSS")</script>' }]))
        component.ngAfterViewInit()
        fixture.detectChanges()
        expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<script>alert("XSS")</script>')
    })

    it('should hold no products when product search API call fails', () => {
        productService.search.mockReturnValue(throwError(() => 'Error'))
        component.ngAfterViewInit()
        fixture.detectChanges()
        expect(component.tableData).toEqual([])
    })

    it('should log error from product search API call directly to browser console', () => {
        productService.search.mockReturnValue(throwError(() => 'Error'))
        console.log = vi.fn()
        component.ngAfterViewInit()
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should hold no products when quantity getAll API call fails', () => {
        quantityService.getAll.mockReturnValue(throwError(() => 'Error'))
        component.ngAfterViewInit()
        fixture.detectChanges()
        expect(component.tableData).toEqual([])
    })

    it('should log error from quantity getAll API call directly to browser console', () => {
        quantityService.getAll.mockReturnValue(throwError(() => 'Error'))
        console.log = vi.fn()
        component.ngAfterViewInit()
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should notify socket if search query includes DOM XSS payload while filtering table', () => {
        activatedRoute.setQueryParameter('<iframe src="javascript:alert(`xss`)"> Payload')
        vi.spyOn(mockSocket, 'emit')
        component.filterTable()
        expect(vi.mocked(mockSocket.emit as any).mock.lastCall[0]).toBe('verifyLocalXssChallenge')
        expect(vi.mocked(mockSocket.emit as any).mock.lastCall[1]).toBe(activatedRoute.snapshot.queryParams.q)
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
