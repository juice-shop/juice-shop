/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { Status, TrackResultComponent } from './track-result.component'
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card'
import { RouterTestingModule } from '@angular/router/testing'
import { TrackOrderService } from '../Services/track-order.service'
import { DomSanitizer } from '@angular/platform-browser'
import { of } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'

describe('TrackResultComponent', () => {
    let component: TrackResultComponent
    let fixture: ComponentFixture<TrackResultComponent>
    let trackOrderService: any
    let sanitizer: any

    beforeEach(async () => {
        trackOrderService = {
            find: vi.fn().mockName("TrackOrderService.find")
        }
        trackOrderService.find.mockReturnValue(of({ data: [{}] }))
        sanitizer = {
            bypassSecurityTrustHtml: vi.fn().mockName("DomSanitizer.bypassSecurityTrustHtml"),
            sanitize: vi.fn().mockName("DomSanitizer.sanitize")
        }
        sanitizer.bypassSecurityTrustHtml.mockImplementation((args: any) => args)
        sanitizer.sanitize.mockReturnValue({})

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                RouterTestingModule,
                MatCardModule,
                MatTableModule,
                TrackResultComponent],
            providers: [
                { provide: TrackOrderService, useValue: trackOrderService },
                { provide: DomSanitizer, useValue: sanitizer },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(TrackResultComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should consider order number as trusted HTML', () => {
        component.orderId = '<a src="link">Link</a>'
        trackOrderService.find.mockReturnValue(of({ data: [{ orderId: component.orderId }] }))
        component.ngOnInit()

        expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<code><a src="link">Link</a></code>')
    })

    it('should set "delivered" status for delivered orders', () => {
        trackOrderService.find.mockReturnValue(of({ data: [{ delivered: true }] }))
        component.ngOnInit()

        expect(component.status).toBe(Status.Delivered)
    })

    it('should set "packing" status for undelivered orders with ETA over 2 days', () => {
        trackOrderService.find.mockReturnValue(of({ data: [{ eta: 3 }] }))
        component.ngOnInit()

        expect(component.status).toBe(Status.Packing)
    })

    it('should set "transit" status for undelivered orders with ETA under 3 days', () => {
        trackOrderService.find.mockReturnValue(of({ data: [{ eta: 2 }] }))
        component.ngOnInit()

        expect(component.status).toBe(Status.Transit)
    })

    it('should set "new" status when the route configures the type flag (new-order page)', () => {
        const route = TestBed.inject(ActivatedRoute) as any
        route.snapshot.data = { type: 'new' }
        trackOrderService.find.mockReturnValue(of({ data: [{ eta: 5 }] }))
        component.ngOnInit()
        expect(component.status).toBe(Status.New)
    })

    it('should fall back to "?" when no ETA is provided in the response', () => {
        trackOrderService.find.mockReturnValue(of({ data: [{ orderId: '123' }] }))
        component.ngOnInit()
        expect(component.results.eta).toBe('?')
    })

    it('should publish the products onto the table data source', () => {
        const products = [{ name: 'Juice', price: 1.99, quantity: 2, total: 3.98 }]
        trackOrderService.find.mockReturnValue(of({ data: [{ products }] }))
        component.ngOnInit()
        expect(component.dataSource.data).toBe(products)
    })

    describe('template rendering', () => {
        function renderWith(data: any): void {
            trackOrderService.find.mockReturnValue(of({ data: [data] }))
            component.ngOnInit()
            fixture.detectChanges()
        }

        it('should highlight the warehouse icon when the order is brand new', () => {
            const route = TestBed.inject(ActivatedRoute) as any
            route.snapshot.data = { type: 'new' }
            renderWith({ eta: 5 })
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('.fa-warehouse.confirmation')).toBeTruthy()
            expect(compiled.querySelector('.fa-home.confirmation')).toBeNull()
        })

        it('should highlight the packing icon when the order is being packed', () => {
            renderWith({ eta: 5 })
            expect((fixture.nativeElement as HTMLElement).querySelector('.fa-truck-loading.confirmation')).toBeTruthy()
        })

        it('should highlight the truck icon when the order is in transit', () => {
            renderWith({ eta: 1 })
            expect((fixture.nativeElement as HTMLElement).querySelector('.fa-truck.confirmation')).toBeTruthy()
        })

        it('should highlight the home icon when the order has been delivered', () => {
            renderWith({ delivered: true, eta: 0 })
            expect((fixture.nativeElement as HTMLElement).querySelector('.fa-home.confirmation')).toBeTruthy()
        })

        it('should render a row per ordered product with name, price, quantity and total', () => {
            renderWith({ products: [{ name: 'Apple Juice', price: 1.99, quantity: 2, total: 3.98 }] })
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelectorAll('mat-row').length).toBe(1)
            expect(compiled.querySelector('.product-name')?.textContent).toContain('Apple Juice')
            expect(compiled.querySelector('.product-price')?.textContent).toContain('1.99')
            expect(compiled.querySelector('.product-quantity')?.textContent).toContain('2')
            expect(compiled.querySelector('.product-total')?.textContent).toContain('3.98')
        })

        it('should render the bonus points hint in the dedicated container', () => {
            renderWith({ bonus: 42, products: [] })
            expect((fixture.nativeElement as HTMLElement).querySelector('.bonus-container')).toBeTruthy()
        })
    })
})
