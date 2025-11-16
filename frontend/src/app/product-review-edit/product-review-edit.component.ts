/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog'
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ProductReviewService } from '../Services/product-review.service'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { type Review } from '../Models/review.model'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { MatButtonModule } from '@angular/material/button'

import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatHint, MatError } from '@angular/material/form-field'
import { TranslateModule } from '@ngx-translate/core'

import { MatIconModule } from '@angular/material/icon'

library.add(faPaperPlane, faArrowCircleLeft)

@Component({
  selector: 'app-product-review-edit',
  templateUrl: './product-review-edit.component.html',
  styleUrls: ['./product-review-edit.component.scss'],
  imports: [MatDialogContent, TranslateModule, MatFormFieldModule, MatLabel, MatInputModule, FormsModule, ReactiveFormsModule, MatHint, MatError, MatDialogActions, MatButtonModule, MatDialogClose, MatIconModule]
})
export class ProductReviewEditComponent implements OnInit {
  data = inject<{
    reviewData: Review;
}>(MAT_DIALOG_DATA);
  private readonly productReviewService = inject(ProductReviewService);
  private readonly dialogRef = inject<MatDialogRef<ProductReviewEditComponent>>(MatDialogRef);
  private readonly snackBarHelperService = inject(SnackBarHelperService);

  public editReviewControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(160)])
  public error: string | null = null

  ngOnInit (): void {
    this.editReviewControl.setValue(this.data.reviewData.message)
  }

  editReview () {
    this.productReviewService.patch({ id: this.data.reviewData._id, message: this.editReviewControl.value }).subscribe({
      next: () => {
        this.dialogRef.close()
      },
      error: (err) => {
        console.log(err)
        this.error = err
      }
    })
    this.snackBarHelperService.open('CONFIRM_CHANGES_SAVED')
  }
}
