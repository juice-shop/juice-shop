/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { firstValueFrom, type Observable, Subject } from 'rxjs'

interface OrderDetail {
  paymentId: string
  addressId: string
  deliveryMethodId: string
}

type GuestBasketItems = Record<string, number>

const GUEST_BASKET_ITEMS_KEY = 'guestBasketItems'

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private readonly http = inject(HttpClient)

  public hostServer = environment.hostServer
  public itemTotal = new Subject<any>()
  private readonly host = this.hostServer + '/api/BasketItems'

  find (id?: number) {
    return this.http.get(`${this.hostServer}/rest/basket/${id}`).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  get (id: number) {
    return this.http.get(`${this.host}/${id}`).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  put (id: number, params: any) {
    return this.http.put(`${this.host}/${id}`, params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  del (id: number) {
    return this.http.delete(`${this.host}/${id}`).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  save (params?: any) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  checkout (id?: number, couponData?: string, orderDetails?: OrderDetail) {
    return this.http.post(`${this.hostServer}/rest/basket/${id}/checkout`, { couponData, orderDetails }).pipe(map((response: any) => response.orderConfirmation), catchError((error) => { throw error }))
  }

  applyCoupon (id?: number, coupon?: string) {
    return this.http.put(`${this.hostServer}/rest/basket/${id}/coupon/${coupon}`, {}).pipe(map((response: any) => response.discount), catchError((error) => { throw error }))
  }

  updateNumberOfCartItems () {
    this.find(parseInt(sessionStorage.getItem('bid'), 10)).subscribe({
      next: (basket) => {

        this.itemTotal.next(basket.Products.reduce((itemTotal, product) => itemTotal + product.BasketItem.quantity, 0))
      },
      error: (err) => { console.log(err) }
    })
  }

  getItemTotal (): Observable<any> {
    return this.itemTotal.asObservable()
  }

  addGuestBasketItem (productId: number, quantity = 1) {
    const guestBasketItems = this.getGuestBasketItems()
    const currentQuantity = guestBasketItems[productId] ?? 0
    guestBasketItems[productId] = currentQuantity + quantity
    sessionStorage.setItem(GUEST_BASKET_ITEMS_KEY, JSON.stringify(guestBasketItems))
  }

  async syncGuestBasketItems () {
    const bid = Number(sessionStorage.getItem('bid'))
    const guestBasketItems = this.getGuestBasketItems()
    const productIds = Object.keys(guestBasketItems)

    if (!Number.isFinite(bid) || productIds.length === 0) {
      return
    }

    const basket = await firstValueFrom(this.find(bid))
    const productsInBasket = basket.Products ?? []

    for (const productId of productIds) {
      const quantityToAdd = guestBasketItems[productId]
      if (quantityToAdd <= 0) {
        continue
      }

      const basketProduct = productsInBasket.find((product) => Number(product.id) === Number(productId))
      if (basketProduct?.BasketItem?.id != null) {
        await firstValueFrom(this.put(basketProduct.BasketItem.id, { quantity: basketProduct.BasketItem.quantity + quantityToAdd }))
        continue
      }

      await firstValueFrom(this.save({ ProductId: Number(productId), BasketId: bid, quantity: quantityToAdd }))
    }

    sessionStorage.removeItem(GUEST_BASKET_ITEMS_KEY)
  }

  private getGuestBasketItems (): GuestBasketItems {
    const rawItems = sessionStorage.getItem(GUEST_BASKET_ITEMS_KEY)
    if (rawItems == null) {
      return {}
    }

    try {
      return JSON.parse(rawItems) as GuestBasketItems
    } catch(error) {
      console.log('Failed to parse guest basket items from session storage:', error)
      return {}
    }
  }
}
