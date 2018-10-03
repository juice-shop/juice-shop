import { ProductReviewEditComponent } from '../product-review-edit/product-review-edit.component'
import { UserService } from '../Services/user.service'
import { ProductReviewService } from '../Services/product-review.service'
import { Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog'
import fontawesome from '@fortawesome/fontawesome'
import { faArrowCircleLeft, faPaperPlane, faUserEdit } from '@fortawesome/fontawesome-free-solid'
import { FormControl, Validators } from '@angular/forms'

fontawesome.library.add(faPaperPlane, faArrowCircleLeft, faUserEdit)

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {

  public author: string
  public reviews$: any
  public userSubscription: any
  public reviewControl: FormControl = new FormControl('',[Validators.maxLength(160)])
  constructor (private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private productReviewService: ProductReviewService,
    private userService: UserService) { }

  ngOnInit () {
    this.data = this.data.productData
    this.reviews$ = this.productReviewService.get(this.data.id)
    this.userSubscription = this.userService.whoAmI().subscribe((user: any) => {
      if (user && user.email) {
        this.author = user.email
      } else {
        this.author = 'Anonymous'
      }
    },(err) => console.log(err))
  }

  ngOnDestroy () {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
  }

  addReview (textPut: HTMLTextAreaElement) {

    const review = { message: textPut.value, author: this.author }

    textPut.value = ''
    this.productReviewService.create(this.data.id, review).subscribe(() => {
      this.reviews$ = this.productReviewService.get(this.data.id)
    },(err) => console.log(err))
  }

  editReview (review) {
    this.dialog.open(ProductReviewEditComponent, {
      width: '600px',
      height: 'max-content',
      data: {
        reviewData : review
      }
    }).afterClosed().subscribe(() => this.reviews$ = this.productReviewService.get(this.data.id))
  }

}
