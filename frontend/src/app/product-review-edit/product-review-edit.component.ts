/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { UntypedFormControl, Validators } from '@angular/forms'
import { ProductReviewService } from '../Services/product-review.service'
import { MatSnackBar } from '@angular/material/snack-bar'

import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { Review } from '../Models/review.model'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

library.add(faPaperPlane, faArrowCircleLeft)
dom.watch()

@Component({
  selector: 'app-product-review-edit',
  templateUrl: './product-review-edit.component.html',
  styleUrls: ['./product-review-edit.component.scss']
  })
export class ProductReviewEditComponent implements OnInit {
  public editReviewControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(160)])
  public error: string | null = null

  constructor (@Inject(MAT_DIALOG_DATA) public data: { reviewData: Review }, private readonly productReviewService: ProductReviewService, private readonly dialogRef: MatDialogRef<ProductReviewEditComponent>,
    private readonly snackBar: MatSnackBar, private readonly snackBarHelperService: SnackBarHelperService) { }

  ngOnInit () {
    this.editReviewControl.setValue(this.data.reviewData.message)
  }

  editReview () {
    this.productReviewService.patch({ id: this.data.reviewData._id, message: this.editReviewControl.value }).subscribe(() => {
      this.dialogRef.close()
    }, (err) => {
      console.log(err)
      this.error = err
    })
    this.snackBarHelperService.open('CONFIRM_CHANGES_SAVED')
  }
}
