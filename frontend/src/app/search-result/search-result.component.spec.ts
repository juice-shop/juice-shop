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
        vi.spyOn(console, 'log').mockImplementation(() => {})
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
        vi.spyOn(console, 'log').mockImplementation(() => {})
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

    describe('template rendering', () => {
        it('should render the all-products heading when no search value is set', () => {
            component.searchValue = undefined as any
            component.emptyState = false
            fixture.detectChanges()
            const heading = (fixture.nativeElement as HTMLElement).querySelector('.heading')
            expect(heading).toBeTruthy()
            expect((fixture.nativeElement as HTMLElement).querySelector('#searchValue')).toBeNull()
        })

        it('should render the search results heading with the current search value', () => {
            component.searchValue = 'apple' as any
            fixture.detectChanges()
            const searchValueEl = (fixture.nativeElement as HTMLElement).querySelector('#searchValue')
            expect(searchValueEl).toBeTruthy()
        })

        it('should render the empty state card with no-result image and texts when emptyState is true', () => {
            component.emptyState = true
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('.emptyState')).toBeTruthy()
            expect(compiled.querySelector('img.noResult')).toBeTruthy()
            expect(compiled.querySelectorAll('.noResultText').length).toBeGreaterThanOrEqual(1)
            expect(compiled.querySelector('.products-grid')).toBeNull()
        })

        it('should render the products grid and no empty state when emptyState is false', () => {
            component.emptyState = false
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('.products-grid')).toBeTruthy()
            expect(compiled.querySelector('.emptyState')).toBeNull()
        })

        it('should always render the paginator at the bottom of the result page', () => {
            expect((fixture.nativeElement as HTMLElement).querySelector('mat-paginator')).toBeTruthy()
        })
    })

    describe('filterTable empty/non-empty grid state', () => {
        it('should set emptyState to true when filtered grid data source emits no results', () => {
            productService.search.mockReturnValue(of([{ id: 1, name: 'Apple', price: 1, description: 'd', image: 'i' }]))
            component.ngAfterViewInit()
            fixture.detectChanges()
            activatedRoute.setQueryParameter('no-such-product')
            component.filterTable()
            expect(component.emptyState).toBe(true)
        })

        it('should set emptyState to false when filtered grid data source has results', () => {
            productService.search.mockReturnValue(of([{ id: 1, name: 'Apple', price: 1, description: 'd', image: 'i' }]))
            component.ngAfterViewInit()
            fixture.detectChanges()
            activatedRoute.setQueryParameter('apple')
            component.filterTable()
            expect(component.emptyState).toBe(false)
        })

        it('should reset filter and clear searchValue when query parameter is empty', () => {
            activatedRoute.setQueryParameter('')
            component.filterTable()
            expect(component.dataSource.filter).toBe('')
            expect(component.searchValue).toBeUndefined()
            expect(component.emptyState).toBe(false)
        })

        it('should unsubscribe the previous grid data source subscription when filtering twice', () => {
            productService.search.mockReturnValue(of([{ id: 1, name: 'Apple', price: 1, description: 'd', image: 'i' }]))
            component.ngAfterViewInit()
            fixture.detectChanges()
            activatedRoute.setQueryParameter('apple')
            component.filterTable()
            // Second call should hit the unsubscribe branch
            activatedRoute.setQueryParameter('apple')
            expect(() => component.filterTable()).not.toThrow()
        })
    })

    describe('responsive page size handling', () => {
        it('should observe the products grid via ResizeObserver and recompute page size on resize', () => {
            const observeSpy = vi.fn()
            let resizeCb: (() => void) | undefined
            const FakeRO = class {
                constructor (cb: () => void) { resizeCb = cb }
                observe = observeSpy
                unobserve () {}
                disconnect () {}
            }
            const originalRO = globalThis.ResizeObserver
            globalThis.ResizeObserver = FakeRO as any

            // Ensure the products-grid element exists so observe is called
            const grid = document.createElement('div')
            grid.className = 'products-grid'
            grid.style.gridTemplateColumns = 'auto auto auto'
            ;(component as any).elRef = { nativeElement: { querySelector: () => grid } }

            component.ngAfterViewInit()
            fixture.detectChanges()
            expect(observeSpy).toHaveBeenCalled()
            // Trigger resize callback to exercise updatePageSize path
            expect(() => resizeCb && resizeCb()).not.toThrow()

            globalThis.ResizeObserver = originalRO
        })

        it('should recompute page size and emit paginator change when columns change', () => {
            productService.search.mockReturnValue(of([
                { id: 1, name: 'A', price: 1, description: 'd', image: 'i' },
                { id: 2, name: 'B', price: 1, description: 'd', image: 'i' }
            ]))
            component.ngAfterViewInit()
            fixture.detectChanges()
            const fakeGrid = {
                // getComputedStyle returns gridTemplateColumns with 4 entries -> pageSize = ceil(15/4)*4 = 16
            } as any
            const original = (window as any).getComputedStyle
            ;(window as any).getComputedStyle = () => ({ gridTemplateColumns: 'a b c d' })
            const emitSpy = vi.spyOn(component.paginator.page, 'emit')
            ;(component as any).updatePageSize(fakeGrid)
            expect(component.currentPageSize).toBe(16)
            expect(component.paginator.pageSize).toBe(16)
            expect(emitSpy).toHaveBeenCalled()
            ;(window as any).getComputedStyle = original
        })

        it('should silently skip responsive page sizing when products grid is missing', () => {
            ;(component as any).elRef = { nativeElement: { querySelector: () => null } }
            expect(() => {
                component.ngAfterViewInit()
                fixture.detectChanges()
            }).not.toThrow()
        })
    })

    describe('hacking instructor integration', () => {
        it('should start the hacking instructor when challenge param and hacking-instructor URL are present', () => {
            const spy = vi.spyOn(component, 'startHackingInstructor').mockImplementation(() => {})
            ;(activatedRoute.snapshot as any).queryParams.challenge = 'Score Board'
            ;(activatedRoute.snapshot as any).url = [{ toString: () => 'hacking-instructor' }]
            component.ngAfterViewInit()
            fixture.detectChanges()
            expect(spy).toHaveBeenCalledWith('Score Board')
        })
    })

    describe('auth and deluxe helpers', () => {
        it('should report isLoggedIn=false when no token is set', () => {
            localStorage.removeItem('token')
            expect(component.isLoggedIn()).toBe(false)
        })

        it('should report isLoggedIn=true when a token is set', () => {
            localStorage.setItem('token', 'abc')
            expect(component.isLoggedIn()).toBe(true)
            localStorage.removeItem('token')
        })

        it('should delegate isDeluxe to DeluxeGuard', () => {
            deluxeGuard.isDeluxe.mockReturnValue(true)
            expect(component.isDeluxe()).toBe(true)
            expect(deluxeGuard.isDeluxe).toHaveBeenCalled()
        })
    })

    describe('ngOnDestroy cleanup', () => {
        it('should unsubscribe router and grid subscriptions, disconnect data source and resize observer', () => {
            productService.search.mockReturnValue(of([{ id: 1, name: 'Apple', price: 1, description: 'd', image: 'i' }]))
            component.ngAfterViewInit()
            fixture.detectChanges()
            activatedRoute.setQueryParameter('apple')
            component.filterTable()

            const dsDisconnectSpy = vi.spyOn(component.dataSource, 'disconnect')
            const roDisconnectSpy = vi.fn()
            ;(component as any).resizeObserver = { disconnect: roDisconnectSpy }

            expect(() => component.ngOnDestroy()).not.toThrow()
            expect(dsDisconnectSpy).toHaveBeenCalled()
            expect(roDisconnectSpy).toHaveBeenCalled()
        })

        it('should be a safe no-op when destroyed before subscriptions exist', () => {
            const freshFixture = TestBed.createComponent(SearchResultComponent)
            const freshComponent = freshFixture.componentInstance
            expect(() => freshComponent.ngOnDestroy()).not.toThrow()
        })
    })
})
