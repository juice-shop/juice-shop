import { UserService } from './../Services/user.service'
import { ProductReviewService } from './../Services/product-review.service'
import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks'
import { map } from 'rxjs/operators'
import fontawesome from '@fortawesome/fontawesome'
import { faPaperPlane, faArrowCircleLeft } from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(faPaperPlane, faArrowCircleLeft)

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {

  public author: string
  public reviews$: any
  public userSubscription: any
  // tslint:disable-next-line:no-unused-variable
  constructor (private dialogRef: MatDialogRef<ProductDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private productReviewService: ProductReviewService,
    private userService: UserService) { }

  ngOnInit () {
    this.data = this.data.productData
    this.reviews$ = this.productReviewService.get(this.data.id)
    this.userSubscription = this.userService.whoAmI().subscribe((user: any) => {
      console.log(user)
      if (user && user.email) {
        this.author = user.email
      } else {
        this.author = 'Anonymous'
      }
    })
  }

  ngOnDestroy () {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
  }

  addReview (textPut: HTMLTextAreaElement) {

    const review = { message: textPut.value, author: this.author }
    this.reviews$ = this.reviews$.pipe(map((reviewArray: any) => {
      if (review.message) {
        reviewArray.push(review)
      }
      return reviewArray
    }))

    textPut.value = ''
    console.log(this.data.id)
    console.log(review)
    this.productReviewService.create(this.data.id, review).subscribe((respone: any) => console.log('Success'), (err) => console.log(err))
  }

}
