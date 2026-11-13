/*!
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideZoneChangeDetection } from '@angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDialog } from '@angular/material/dialog'
import { of, Subject } from 'rxjs'

import { ProductReviewsComponent } from './product-reviews.component'
import { ProductReviewService } from '../Services/product-review.service'
import { UserService } from '../Services/user.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { ProductReviewEditComponent } from '../product-review-edit/product-review-edit.component'

describe('ProductReviewsComponent', () => {
  let component: ProductReviewsComponent
  let fixture: ComponentFixture<ProductReviewsComponent>
  let productReviewService: any
  let userService: any
  let snackBarHelper: any
  let dialog: any

  const testReview = { _id: 'abc', message: 'Nice juice', author: 'user@example.com', likesCount: 2 }

  const createComponent = (expanded = true) => {
    const reviewsFixture = TestBed.createComponent(ProductReviewsComponent)
    reviewsFixture.componentRef.setInput('productId', 12)
    reviewsFixture.componentInstance.expanded.set(expanded)
    reviewsFixture.detectChanges()
    return reviewsFixture
  }

  beforeEach(async () => {
    productReviewService = {
      get: vi.fn().mockName('ProductReviewService.get'),
      create: vi.fn().mockName('ProductReviewService.create'),
      like: vi.fn().mockName('ProductReviewService.like')
    }
    productReviewService.get.mockReturnValue(of([]))
    productReviewService.create.mockReturnValue(of({}))
    productReviewService.like.mockReturnValue(of({}))

    userService = {
      whoAmI: vi.fn().mockName('UserService.whoAmI')
    }
    userService.whoAmI.mockReturnValue(of({ email: 'user@example.com' }))

    snackBarHelper = {
      open: vi.fn().mockName('SnackBarHelperService.open')
    }
    dialog = {
      open: vi.fn().mockName('MatDialog.open')
    }
    dialog.open.mockReturnValue({ afterClosed: () => of(undefined) })

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ProductReviewsComponent],
      providers: [
        provideZoneChangeDetection(),
        { provide: ProductReviewService, useValue: productReviewService },
        { provide: UserService, useValue: userService },
        { provide: SnackBarHelperService, useValue: snackBarHelper },
        { provide: MatDialog, useValue: dialog }
      ]
    })
      .compileComponents()

    const translateService = TestBed.inject(TranslateService)
    vi.spyOn(translateService, 'get').mockReturnValue(of('ok'))

    fixture = createComponent(false)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should keep the reviews panel closed by default', () => {
    expect(component.expanded()).toBe(false)
  })

  it('should load and render the reviews of the product', async () => {
    productReviewService.get.mockReturnValue(of([testReview]))
    const reviewsFixture = createComponent()
    await vi.waitFor(() => {
      reviewsFixture.detectChanges()
      expect(productReviewService.get).toHaveBeenCalledWith(12)
      expect(reviewsFixture.nativeElement.querySelector('.comment .review-message')?.textContent).toContain('Nice juice')
      expect(reviewsFixture.nativeElement.querySelector('.like-counter')?.textContent).toContain('2')
    })
  })

  it('should show a hint when the product has no reviews yet', async () => {
    const reviewsFixture = createComponent()
    await vi.waitFor(() => {
      reviewsFixture.detectChanges()
      expect(reviewsFixture.nativeElement.querySelector('.noResultText')).toBeTruthy()
    })
  })

  it('should add a review for the current product', async () => {
    component.reviewModel.set({ message: 'Great juice' })
    await component.addReview()
    expect(productReviewService.create).toHaveBeenCalledWith(12, { message: 'Great juice', author: 'user@example.com' })
    expect(component.reviewModel().message).toBe('')
    expect(snackBarHelper.open).toHaveBeenCalledWith('CONFIRM_REVIEW_SAVED')
  })

  it('should like a review and mark it as liked', () => {
    component.reviews.set([testReview])
    component.likeReview(testReview)
    expect(productReviewService.like).toHaveBeenCalledWith('abc')
    expect(component.likedReviewId()).toBe('abc')
    expect(component.isLikePending('abc')).toBe(false)
  })

  it('should ignore a like while the same review is still pending', () => {
    const pendingLike = new Subject<any>()
    productReviewService.like.mockReturnValue(pendingLike)
    component.likeReview(testReview)
    component.likeReview(testReview)
    expect(productReviewService.like).toHaveBeenCalledTimes(1)
    expect(component.isLikePending('abc')).toBe(true)
    pendingLike.next({})
    pendingLike.complete()
    expect(component.isLikePending('abc')).toBe(false)
  })

  it('should only treat reviews of the logged-in author as own', () => {
    const otherReview = { _id: 'def', message: 'Nice', author: 'someone' }
    localStorage.setItem('token', 'token')
    expect(component.isOwnReview(testReview)).toBe(true)
    expect(component.isOwnReview(otherReview)).toBe(false)
    localStorage.removeItem('token')
    expect(component.isOwnReview(testReview)).toBe(false)
  })

  it('should open the edit review dialog', () => {
    component.editReview(testReview)
    expect(dialog.open).toHaveBeenCalledWith(ProductReviewEditComponent, expect.objectContaining({
      data: { reviewData: testReview }
    }))
  })

  it('should hide the write review form when logged out', () => {
    localStorage.removeItem('token')
    const reviewsFixture = createComponent()
    expect(reviewsFixture.nativeElement.querySelector('mat-form-field').style.display).toBe('none')
    expect(reviewsFixture.nativeElement.querySelector('#submitButton').style.display).toBe('none')
  })
})
