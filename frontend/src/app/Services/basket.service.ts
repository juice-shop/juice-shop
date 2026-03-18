/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { type Observable, Subject, forkJoin, of } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'

interface OrderDetail {
  paymentId: string
  addressId: string
  deliveryMethodId: string
}

interface GuestBasketItem {
  ProductId: number
  quantity: number
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private readonly http = inject(HttpClient)

  public hostServer = environment.hostServer
  public itemTotal = new Subject<any>()
  private readonly host = this.hostServer + '/api/BasketItems'
  private readonly guestBasketKey = 'guestBasket'

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
    if (localStorage.getItem('token')) {
      this.find(parseInt(sessionStorage.getItem('bid'), 10)).subscribe({
        next: (basket) => {
          this.itemTotal.next(basket.Products.reduce((itemTotal, product) => itemTotal + product.BasketItem.quantity, 0))
        },
        error: (err) => { console.log(err) }
      })
      return
    }

    const guestBasketItems = this.getGuestBasketItems()
    this.itemTotal.next(guestBasketItems.reduce((itemTotal, item) => itemTotal + item.quantity, 0))
  }

  getItemTotal (): Observable<any> {
    return this.itemTotal.asObservable()
  }

  getGuestBasketItems (): GuestBasketItem[] {
    const rawGuestBasket = sessionStorage.getItem(this.guestBasketKey)
    if (rawGuestBasket == null) {
      return []
    }

    try {
      const parsedGuestBasket = JSON.parse(rawGuestBasket)
      if (Array.isArray(parsedGuestBasket)) {
        return parsedGuestBasket
          .map((item: any) => {
            const productId = Number(item?.ProductId)
            const quantity = Number(item?.quantity)
            if (!Number.isInteger(productId) || productId < 1 || !Number.isFinite(quantity) || quantity < 1) {
              return null
            }
            return {
              ProductId: productId,
              quantity: Math.floor(quantity)
            }
          })
          .filter((item): item is GuestBasketItem => item != null)
      }
      return []
    } catch {
      return []
    }
  }

  addToGuestBasket (productId: number, quantity = 1): void {
    const guestBasketItems = this.getGuestBasketItems()
    const existingGuestItem = guestBasketItems.find(item => item.ProductId === productId)

    if (existingGuestItem != null) {
      existingGuestItem.quantity += quantity
    } else {
      guestBasketItems.push({ ProductId: productId, quantity })
    }

    sessionStorage.setItem(this.guestBasketKey, JSON.stringify(guestBasketItems))
    this.updateNumberOfCartItems()
  }

  updateGuestBasketItemQuantity (productId: number, quantity: number): void {
    const guestBasketItems = this.getGuestBasketItems()
    const guestItemToUpdate = guestBasketItems.find(item => item.ProductId === productId)
    if (guestItemToUpdate == null) {
      return
    }

    guestItemToUpdate.quantity = Math.max(1, quantity)
    sessionStorage.setItem(this.guestBasketKey, JSON.stringify(guestBasketItems))
    this.updateNumberOfCartItems()
  }

  removeGuestBasketItem (productId: number): void {
    const guestBasketItems = this.getGuestBasketItems().filter(item => item.ProductId !== productId)
    sessionStorage.setItem(this.guestBasketKey, JSON.stringify(guestBasketItems))
    this.updateNumberOfCartItems()
  }

  clearGuestBasket (): void {
    sessionStorage.removeItem(this.guestBasketKey)
    this.updateNumberOfCartItems()
  }

  mergeGuestBasketIntoUserBasket (targetBasketId: number): Observable<void> {
    const mergedGuestBasketItems = this.getGuestBasketItems().reduce((basketMap, item) => {
      basketMap.set(item.ProductId, (basketMap.get(item.ProductId) ?? 0) + item.quantity)
      return basketMap
    }, new Map<number, number>())

    if (mergedGuestBasketItems.size === 0) {
      return of(void 0)
    }

    return this.find(targetBasketId).pipe(
      catchError(() => of({ Products: [] })),
      switchMap((targetBasket: any) => {
        const existingProducts = new Map<number, any>()
        ;(targetBasket.Products ?? []).forEach((product: any) => {
          existingProducts.set(product.id, product.BasketItem)
        })

        const mergeRequests = Array.from(mergedGuestBasketItems.entries()).map(([productId, quantity]) => {
          const existingBasketItem = existingProducts.get(productId)
          if (existingBasketItem != null) {
            return this.put(existingBasketItem.id, { quantity: existingBasketItem.quantity + quantity }).pipe(catchError(() => of(null)))
          }
          return this.save({ ProductId: productId, BasketId: targetBasketId, quantity }).pipe(catchError(() => of(null)))
        })

        if (mergeRequests.length === 0) {
          return of([])
        }

        return forkJoin(mergeRequests)
      }),
      tap(() => {
        this.clearGuestBasket()
      }),
      map(() => void 0)
    )
  }
}
