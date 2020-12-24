/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ProductReviewEditComponent } from '../product-review-edit/product-review-edit.component'
import { UserService } from '../Services/user.service'
import { ProductReviewService } from '../Services/product-review.service'
import { Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleLeft, faCrown, faPaperPlane, faThumbsUp, faUserEdit } from '@fortawesome/free-solid-svg-icons'
import { FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { Review } from '../Models/review.model'
import { Product } from '../Models/product.model'

library.add(faPaperPlane, faArrowCircleLeft, faUserEdit, faThumbsUp, faCrown)
dom.watch()

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  public author: string = 'Anonymous'
  public reviews$: any
  public userSubscription: any
  public reviewControl: FormControl = new FormControl('', [Validators.maxLength(160)])
  constructor (private readonly dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { productData: Product}, private readonly productReviewService: ProductReviewService,
    private readonly userService: UserService, private readonly snackBar: MatSnackBar, private readonly snackBarHelperService: SnackBarHelperService) { }

  ngOnInit () {
    this.data.productData.points = Math.round(this.data.productData.price / 10)
    this.reviews$ = this.productReviewService.get(this.data.productData.id)
    this.userSubscription = this.userService.whoAmI().subscribe((user: any) => {
      if (user && user.email) {
        this.author = user.email
      } else {
        this.author = 'Anonymous'
      }
    }, (err) => console.log(err))
  }

  ngOnDestroy () {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
  }

  addReview (textPut: HTMLTextAreaElement) {
    const review = { message: textPut.value, author: this.author }

    textPut.value = ''
    this.productReviewService.create(this.data.productData.id, review).subscribe(() => {
      this.reviews$ = this.productReviewService.get(this.data.productData.id)
    }, (err) => console.log(err))
    this.snackBarHelperService.open('CONFIRM_REVIEW_SAVED')
  }

  editReview (review: Review) {
    this.dialog.open(ProductReviewEditComponent, {
      width: '500px',
      height: 'max-content',
      data: {
        reviewData: review
      }
    }).afterClosed().subscribe(() => this.reviews$ = this.productReviewService.get(this.data.productData.id))
  }

  likeReview (review: Review) {
    this.productReviewService.like(review._id).subscribe(() => {
      console.log('Liked ' + review._id)
    })
    setTimeout(() => this.reviews$ = this.productReviewService.get(this.data.productData.id), 200)
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }
}
