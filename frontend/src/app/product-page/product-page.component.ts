/*!
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, NgZone, type OnDestroy, resource, signal, viewChild } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { catchError, map } from 'rxjs/operators'
import { firstValueFrom, of } from 'rxjs'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip } from '@angular/material/tooltip'
import { MatCardModule } from '@angular/material/card'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCrown } from '@fortawesome/free-solid-svg-icons'

import { ProductService } from '../Services/product.service'
import { BasketService } from '../Services/basket.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { DeluxeGuard } from '../app.guard'
import { ProductComponent } from '../product/product.component'
import { ProductImageComponent } from '../product-image/product-image.component'
import { ProductReviewsComponent } from '../product-reviews/product-reviews.component'
import { type Product } from '../Models/product.model'

const IMAGE_BASE_PATH = 'assets/public/images/products/'

library.add(faCrown)

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.scss',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltip,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslateModule,
    ProductComponent,
    ProductImageComponent,
    ProductReviewsComponent
  ]
})
export class ProductPageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly location = inject(Location)
  private readonly productService = inject(ProductService)
  private readonly basketService = inject(BasketService)
  private readonly translateService = inject(TranslateService)
  private readonly snackBarHelperService = inject(SnackBarHelperService)
  private readonly deluxeGuard = inject(DeluxeGuard)
  private readonly ngZone = inject(NgZone)

  readonly relatedGrid = viewChild<ElementRef<HTMLElement>>('relatedGrid')
  readonly reviewsSection = viewChild(ProductReviewsComponent, { read: ElementRef })
  readonly columnCount = signal(4)
  readonly relatedDisplayCount = computed(() => Math.max(1, this.columnCount()))
  readonly relatedProducts = computed(() => (this.relatedProductsResource.value() ?? []).slice(0, this.relatedDisplayCount()))
  readonly reviewsExpanded = signal(false)
  readonly quantity = signal(1)

  /* Mirrors the candidates of <app-product-image> so the blurred backdrop reuses the image
     already fetched by the <picture> instead of downloading the fallback on top of it */
  readonly backgroundImage = computed(() => {
    const product = this.productResource.value()
    if (product == null) {
      return ''
    }
    const fallback = `url("${IMAGE_BASE_PATH}${product.image}")`
    /* image-set() only understands resolution descriptors, so width-based candidates are left out */
    const candidates = (product.alternateImages ?? []).filter((image) => image.density)
    if (candidates.length === 0) {
      return fallback
    }
    return `image-set(${[
      ...candidates.map((image) => `url("${IMAGE_BASE_PATH}${image.file}") type("${image.format}") ${image.density}`),
      `${fallback} 1x`
    ].join(', ')})`
  })

  private resizeObserver?: ResizeObserver
  private observedGrid?: HTMLElement

  constructor () {
    effect(() => {
      if (this.reviewsQuery() === 'true') {
        this.reviewsExpanded.set(true)
        const section = this.reviewsSection()
        if (this.productResource.value() != null && section) {
          this.scrollToReviewsSection(section.nativeElement)
        }
      }
    })

    effect(() => {
      const grid = this.relatedGrid()
      if (grid) {
        this.observeGrid(grid.nativeElement)
      }
    })
  }

  readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const id = params.get('id')
      return id != null ? Number(id) : undefined
    })),
    { initialValue: undefined }
  )

  readonly searchQuery = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' }
  )

  readonly reviewsQuery = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('goto-reviews'))),
    { initialValue: undefined }
  )

  readonly productResource = resource({
    params: () => this.productId(),
    loader: ({ params: id }) =>
      firstValueFrom(
        this.productService.get(id).pipe(
          catchError(() => of(undefined))
        )
      )
  })

  readonly relatedProductsResource = resource({
    params: () => {
      const id = this.productId()
      return id != null ? { id, q: this.searchQuery() } : undefined
    },
    loader: ({ params }) =>
      firstValueFrom(
        this.productService.search(params.q).pipe(
          map((products: Product[]) => {
            const others = products.filter((product) => product.id !== params.id)
            // Keep search results in relevance order; shuffle only the
            // all-products fallback so deep links still show varied items.
            return params.q ? others : this.shuffle(others)
          }),
          catchError(() => of([]))
        )
      )
  })

  readonly points = computed(() => {
    const price = this.productResource.value()?.price
    return price != null ? Math.round(price / 10) : 0
  })

  goBack (): void {
    if (window.history.length > 1) {
      this.location.back()
    } else {
      void this.router.navigate(['/search'])
    }
  }

  isLoggedIn (): boolean {
    return localStorage.getItem('token') !== null
  }

  isDeluxe (): boolean {
    return this.deluxeGuard.isDeluxe()
  }

  incrementQuantity (): void {
    this.quantity.update((value) => value + 1)
  }

  decrementQuantity (): void {
    this.quantity.update((value) => Math.max(1, value - 1))
  }

  addToBasket (): void {
    const id = this.productId()
    if (id == null) {
      return
    }

    if (!this.isLoggedIn()) {
      this.basketService.addToGuestBasket(id, this.quantity())
      this.productService.get(id).subscribe({
        next: (product) => this.showBasketSnackbar('BASKET_ADD_PRODUCT', product.name),
        error: (err) => { console.log(err) }
      })
      return
    }

    this.basketService.find(Number(sessionStorage.getItem('bid'))).subscribe({
      next: (basket) => {
        const productsInBasket: any[] = basket.Products
        const existingProduct = productsInBasket.find((item) => item.id === id)
        if (existingProduct != null) {
          this.increaseBasketItem(existingProduct.BasketItem.id)
        } else {
          this.saveBasketItem(id)
        }
      },
      error: (err) => { console.log(err) }
    })
  }

  private increaseBasketItem (basketItemId: number): void {
    this.basketService.get(basketItemId).subscribe({
      next: (existingBasketItem) => {
        const newQuantity = existingBasketItem.quantity + this.quantity()
        this.basketService.put(existingBasketItem.id, { quantity: newQuantity }).subscribe({
          next: (updatedBasketItem) => {
            this.productService.get(updatedBasketItem.ProductId).subscribe({
              next: (product) => {
                this.showBasketSnackbar('BASKET_ADD_SAME_PRODUCT', product.name)
                this.basketService.updateNumberOfCartItems()
              },
              error: (err) => { console.log(err) }
            })
          },
          error: (err) => {
            this.snackBarHelperService.open(err.error?.error, 'errorBar')
            console.log(err)
          }
        })
      },
      error: (err) => { console.log(err) }
    })
  }

  private saveBasketItem (id: number): void {
    this.basketService.save({
      ProductId: id,
      BasketId: sessionStorage.getItem('bid'),
      quantity: this.quantity()
    }).subscribe({
      next: (newBasketItem) => {
        this.productService.get(newBasketItem.ProductId).subscribe({
          next: (product) => {
            this.showBasketSnackbar('BASKET_ADD_PRODUCT', product.name)
            this.basketService.updateNumberOfCartItems()
          },
          error: (err) => { console.log(err) }
        })
      },
      error: (err) => {
        this.snackBarHelperService.open(err.error?.error, 'errorBar')
        console.log(err)
      }
    })
  }

  private showBasketSnackbar (translationKey: string, productName: string): void {
    this.translateService.get(translationKey, { product: productName }).subscribe({
      next: (message) => this.snackBarHelperService.open(message, 'confirmBar'),
      error: (translationId) => this.snackBarHelperService.open(translationId, 'confirmBar')
    })
  }

  private shuffle<T> (items: T[]): T[] {
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = temp
    }
    return shuffled
  }

  ngOnDestroy (): void {
    this.resizeObserver?.disconnect()
  }

  private scrollToReviewsSection (element: HTMLElement): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  private observeGrid (grid: HTMLElement): void {
    if (this.observedGrid === grid) {
      return
    }
    this.resizeObserver?.disconnect()
    this.observedGrid = grid
    this.resizeObserver = new ResizeObserver(() => {
      this.ngZone.run(() => this.updateColumnCount(grid))
    })
    this.resizeObserver.observe(grid)
    this.updateColumnCount(grid)
  }

  private updateColumnCount (grid: HTMLElement): void {
    if (!grid.isConnected) {
      return
    }
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length
    if (columns > 0 && columns !== this.columnCount()) {
      this.columnCount.set(columns)
    }
  }
}
