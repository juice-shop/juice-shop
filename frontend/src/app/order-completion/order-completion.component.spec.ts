/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialogModule } from '@angular/material/dialog'
import { of, throwError } from 'rxjs'
import { OrderCompletionComponent } from './order-completion.component'
import { TrackOrderService } from '../Services/track-order.service'
import { ActivatedRoute, convertToParamMap } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { BasketService } from '../Services/basket.service'
import { MatTooltipModule } from '@angular/material/tooltip'
import { AddressService } from '../Services/address.service'
import { ConfigurationService } from '../Services/configuration.service'

export class MockActivatedRoute {
  public paramMap = of(convertToParamMap({
    id: 'ad9b-96017e7cb1ae7bf9'
  }))
}

describe('OrderCompletionComponent', () => {
  let component: OrderCompletionComponent
  let fixture: ComponentFixture<OrderCompletionComponent>
  let trackOrderService: any
  let activatedRoute: any
  let basketService: any
  let addressService: any
  let configurationService: any

  beforeEach(waitForAsync(() => {

    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    trackOrderService = jasmine.createSpyObj('TrackOrderService', ['save'])
    trackOrderService.save.and.returnValue(of({ data: [{ products: [] }] }))
    activatedRoute = new MockActivatedRoute()
    addressService = jasmine.createSpyObj('AddressService',['getById'])
    addressService.getById.and.returnValue(of([]))

    TestBed.configureTestingModule({
      declarations: [ OrderCompletionComponent ],
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
        MatCardModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [
        { provide: TrackOrderService, useValue: trackOrderService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: BasketService, useValue: basketService },
        { provide: ConfigurationService, useValue: configurationService },
        { provide: AddressService, useValue: addressService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCompletionComponent)
    component = fixture.componentInstance
    component.ngOnInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold order details returned by backend API', () => {
    trackOrderService.save.and.returnValue(of({ data: [{ totalPrice: 2.88, promotionalAmount: 10, deliveryPrice: 2, addressId: 1, paymentId: 1, products: [{ quantity: 1, name: 'Apple Juice (1000ml)', price: 1.99,total: 1.99, bonus: 0 },{ quantity: 1, name: 'Apple Pomace', price: 0.89, total: 0.89, bonus: 0 }], bonus: 0, eta: '5' }] }))
    component.ngOnInit()
    fixture.detectChanges()
    expect(component.promotionalDiscount).toBe(10)
    expect(component.deliveryPrice).toBe(2)
    expect(component.orderDetails.addressId).toBe(1)
    expect(component.orderDetails.paymentId).toBe(1)
    expect(parseFloat((component.orderDetails.totalPrice).toFixed(2))).toBe(2.88)
    expect(parseFloat((component.orderDetails.itemTotal).toFixed(2))).toBe(10.88)
    expect(component.orderDetails.eta).toBe('5')
    expect(component.orderDetails.bonus).toBe(0)
    expect(component.orderDetails.products.length).toBe(2)
    expect(component.orderDetails.products[0].name).toBe('Apple Juice (1000ml)')
    expect(component.orderDetails.products[1].name).toBe('Apple Pomace')
  })

  it('should have bullet point list of products in tweet', () => {
    trackOrderService.save.and.returnValue(of({ data: [{ products: [ { name: 'A' }, { name: 'B' }] }] }))
    configurationService.getApplicationConfiguration.and.returnValue(of({ }))
    component.ngOnInit()
    expect(component.tweetText).toBe('I just purchased%0a- A%0a- B')
  })

  it('should truncate tweet text if it exceeds 140 characters', () => {
    trackOrderService.save.and.returnValue(of({ data: [{ products: [ { name: 'AAAAAAAAAAAAAAAAAAAA' }, { name: 'BBBBBBBBBBBBBBBBBBBB' }, { name: 'CCCCCCCCCCCCCCCCCCCC' }, { name: 'DDDDDDDDDDDDDDDDDDDD' }, { name: 'EEEEEEEEEEEEEEEEEEEE' }, { name: 'FFFFFFFFFFFFFFFFFFFF' }] }] }))
    configurationService.getApplicationConfiguration.and.returnValue(of({ }))
    component.ngOnInit()
    expect(component.tweetText).toBe('I just purchased%0a- AAAAAAAAAAAAAAAAAAAA%0a- BBBBBBBBBBBBBBBBBBBB%0a- CCCCCCCCCCCCCCCCCCCC%0a- DDDDDDDDDDDDDDDDDDDD%0a- EEEEEEEEEEEEEEEEEEE...')
  })

  it('should derive twitter handle from twitter URL if configured', () => {
    trackOrderService.save.and.returnValue(of({ data: [{ products: [ ] }] }))
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { social: { twitterUrl: 'https://twitter.com/bkimminich' } } }))
    component.ngOnInit()
    expect(component.tweetText).toBe('I just purchased%0afrom @bkimminich')
  })

  it('should append twitter handle to truncated tweet text', () => {
    trackOrderService.save.and.returnValue(of({ data: [{ products: [ { name: 'AAAAAAAAAAAAAAAAAAAA' }, { name: 'BBBBBBBBBBBBBBBBBBBB' }, { name: 'CCCCCCCCCCCCCCCCCCCC' }, { name: 'DDDDDDDDDDDDDDDDDDDD' }, { name: 'EEEEEEEEEEEEEEEEEEEE' }, { name: 'FFFFFFFFFFFFFFFFFFFF' }] }] }))
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { social: { twitterUrl: 'https://twitter.com/owasp_juiceshop' } } }))
    component.ngOnInit()
    expect(component.tweetText).toBe('I just purchased%0a- AAAAAAAAAAAAAAAAAAAA%0a- BBBBBBBBBBBBBBBBBBBB%0a- CCCCCCCCCCCCCCCCCCCC%0a- DDDDDDDDDDDDDDDDDDDD%0a- EEEEEEEEEEEEEEEEEEE...%0afrom @owasp_juiceshop')
  })

  it('should use configured URL as is if it is not a twitter URL', () => {
    trackOrderService.save.and.returnValue(of({ data: [{ products: [ ] }] }))
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { social: { twitterUrl: 'http://localhorst:42' } } }))
    component.ngOnInit()
    expect(component.tweetText).toBe('I just purchased%0afrom http://localhorst:42')
  })

  it('should use configured application name as a fallback for missing twitter URL', () => {
    trackOrderService.save.and.returnValue(of({ data: [{ products: [ ] }] }))
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { name: 'OWASP Juice Shop', social: { twitterUrl: null } } }))
    component.ngOnInit()
    expect(component.tweetText).toBe('I just purchased%0afrom OWASP Juice Shop')
  })

  it('should log error while getting application configuration from backend API directly to browser console', fakeAsync(() => {
    trackOrderService.save.and.returnValue(of({ data: [{ products: [] }] }))
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log error while getting order details from backend API directly to browser console' , fakeAsync(() => {
    trackOrderService.save.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

})
