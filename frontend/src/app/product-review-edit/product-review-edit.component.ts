/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog'
import { form, FormField, maxLength, pattern, required, submit } from '@angular/forms/signals'
import { firstValueFrom } from 'rxjs'
import { ProductReviewService } from '../Services/product-review.service'

import { type Review } from '../Models/review.model'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { MatButtonModule } from '@angular/material/button'

import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatHint, MatError } from '@angular/material/form-field'
import { TranslateModule } from '@ngx-translate/core'

import { MatIconModule } from '@angular/material/icon'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-product-review-edit',
  templateUrl: './product-review-edit.component.html',
  styleUrls: ['./product-review-edit.component.scss'],
  imports: [MatDialogContent, TranslateModule, MatFormFieldModule, MatLabel, MatInputModule, FormField, MatHint, MatError, MatDialogActions, MatButtonModule, MatDialogClose, MatIconModule]
})
export class ProductReviewEditComponent {
  data = inject<{
    reviewData: Review;
}>(MAT_DIALOG_DATA)
  private readonly productReviewService = inject(ProductReviewService)
  private readonly dialogRef = inject<MatDialogRef<ProductReviewEditComponent>>(MatDialogRef)
  private readonly snackBarHelperService = inject(SnackBarHelperService)

  private readonly initialModel = {
    message: this.data.reviewData.message
  }

  public readonly reviewModel = signal({ ...this.initialModel })

  public readonly reviewForm = form(this.reviewModel, (s) => {
    required(s.message)
    pattern(s.message, /\S/)
    maxLength(s.message, 160)
  })

  editReview () {
    return submit(this.reviewForm, async () => {
      try {
        await firstValueFrom(this.productReviewService.patch({ id: this.data.reviewData._id, message: this.reviewModel().message }))
        this.dialogRef.close()
        this.snackBarHelperService.open('CONFIRM_CHANGES_SAVED')
      } catch (err: any) {
        console.log(err)
      }
    })
  }
}
