/*!
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, model, signal } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { form, FormField, submit } from '@angular/forms/signals'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion'
import { MatError, MatFormFieldModule, MatHint, MatLabel } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatTooltip } from '@angular/material/tooltip'
import { TranslateModule } from '@ngx-translate/core'
import { catchError, map, switchMap } from 'rxjs/operators'
import { EMPTY, finalize, firstValueFrom, of, Subject } from 'rxjs'

import { ProductReviewService } from '../Services/product-review.service'
import { UserService } from '../Services/user.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { ProductReviewEditComponent } from '../product-review-edit/product-review-edit.component'
import { MAX_REVIEW_LENGTH, reviewFormSchema } from '../Models/review-form.schema'
import { type Review } from '../Models/review.model'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.scss',
  imports: [
    MatButtonModule,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatTooltip,
    MatInputModule,
    MatFormFieldModule,
    MatLabel,
    MatHint,
    MatError,
    MatIconModule,
    FormField,
    TranslateModule
  ]
})
export class ProductReviewsComponent {
  readonly productId = input.required<number>()
  readonly expanded = model(false)

  private readonly dialog = inject(MatDialog)
  private readonly productReviewService = inject(ProductReviewService)
  private readonly userService = inject(UserService)
  private readonly snackBarHelperService = inject(SnackBarHelperService)
  private readonly destroyRef = inject(DestroyRef)

  readonly maxReviewLength = MAX_REVIEW_LENGTH
  readonly reviews = signal<Review[]>([])
  readonly likedReviewId = signal<string | null>(null)
  readonly pendingLikeIds = signal<string[]>([])

  readonly author = toSignal(
    this.userService.whoAmI(['email']).pipe(
      map((user: { email?: string }) => (user?.email ? user.email : 'Anonymous')),
      catchError(() => of('Anonymous'))
    ),
    { initialValue: 'Anonymous' }
  )

  private readonly reloadReviews$ = new Subject<number>()
  private readonly initialReviewModel = { message: '' }
  readonly reviewModel = signal({ ...this.initialReviewModel })
  readonly reviewForm = form(this.reviewModel, reviewFormSchema)

  constructor () {
    this.reloadReviews$
      .pipe(
        switchMap((id) => this.productReviewService.get(id).pipe(
          catchError((err) => {
            console.log(err)
            return EMPTY
          })
        )),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((reviews: Review[]) => this.reviews.set(reviews))

    effect(() => {
      this.reloadReviews$.next(this.productId())
    })
  }

  addReview () {
    return submit(this.reviewForm, async () => {
      const review = { message: this.reviewModel().message, author: this.author() }
      try {
        await firstValueFrom(this.productReviewService.create(this.productId(), review))
        this.reviewForm().reset({ ...this.initialReviewModel })
        this.loadReviews()
        this.snackBarHelperService.open('CONFIRM_REVIEW_SAVED')
      } catch (err: any) {
        console.log(err)
      }
    })
  }

  editReview (review: Review): void {
    this.dialog.open(ProductReviewEditComponent, {
      width: '500px',
      height: 'max-content',
      data: {
        reviewData: review
      }
    }).afterClosed().subscribe(() => this.loadReviews())
  }

  likeReview (review: Review): void {
    if (this.isLikePending(review._id)) {
      return
    }

    this.setLikePending(review._id, true)
    this.productReviewService.like(review._id)
      .pipe(finalize(() => {
        this.setLikePending(review._id, false)
        this.loadReviews()
      }))
      .subscribe({
        next: () => this.markReviewAsLiked(review._id),
        error: (err) => console.log(err)
      })
  }

  isOwnReview (review: Review): boolean {
    return this.isLoggedIn() && this.author() !== 'Anonymous' && review.author === this.author()
  }

  isLikePending (reviewId: string): boolean {
    return this.pendingLikeIds().includes(reviewId)
  }

  isLoggedIn (): boolean {
    return localStorage.getItem('token') !== null
  }

  private loadReviews (): void {
    this.reloadReviews$.next(this.productId())
  }

  private setLikePending (reviewId: string, pending: boolean): void {
    this.pendingLikeIds.update((ids) =>
      pending
        ? [...ids, reviewId]
        : ids.filter((id) => id !== reviewId)
    )
  }

  private markReviewAsLiked (reviewId: string): void {
    this.reviews.update((reviews) =>
      reviews.map((review) =>
        review._id === reviewId
          ? { ...review, liked: true }
          : review
      )
    )
    this.likedReviewId.set(reviewId)
  }
}
