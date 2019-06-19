import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { FormControl, Validators } from '@angular/forms'
import { ProductReviewService } from '../Services/product-review.service'
import { MatSnackBar } from '@angular/material/snack-bar'

import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

library.add(faPaperPlane, faArrowCircleLeft)
dom.watch()

@Component({
  selector: 'app-product-review-edit',
  templateUrl: './product-review-edit.component.html',
  styleUrls: ['./product-review-edit.component.scss']
})
export class ProductReviewEditComponent implements OnInit {

  public editReviewControl: FormControl = new FormControl('',[ Validators.required, Validators.minLength(1), Validators.maxLength(160)])
  public error: any

  constructor (@Inject(MAT_DIALOG_DATA) public data, private productReviewService: ProductReviewService, private dialogRef: MatDialogRef<ProductReviewEditComponent>,
    private snackBar: MatSnackBar) { }

  ngOnInit () {
    this.data = this.data.reviewData
    this.editReviewControl.setValue(this.data.message)
  }

  editReview () {
    this.productReviewService.patch({ id: this.data._id, message: this.editReviewControl.value }).subscribe(() => {
      this.dialogRef.close()
    },(err) => {
      console.log(err)
      this.error = err
    })
    this.openSnackBar('Your changes have been saved', 'Ok')
  }

  openSnackBar (message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    })
  }
}
