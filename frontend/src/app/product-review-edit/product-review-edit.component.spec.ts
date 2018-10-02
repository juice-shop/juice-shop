import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { ProductReviewEditComponent } from './product-review-edit.component'
import { ReactiveFormsModule } from '@angular/forms'
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { of, throwError } from 'rxjs'
import { ProductReviewService } from 'src/app/Services/product-review.service'
import { MatInputModule } from '@angular/material/input'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

describe('ProductReviewEditComponent', () => {
  let component: ProductReviewEditComponent
  let fixture: ComponentFixture<ProductReviewEditComponent>
  let productReviewService
  let dialogRef

  beforeEach(async(() => {

    productReviewService = jasmine.createSpyObj('ProductReviewService',['patch'])
    productReviewService.patch.and.returnValue(of({}))
    dialogRef = jasmine.createSpyObj('MatDialogRef',['close'])
    dialogRef.close.and.returnValue({})

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
      ],
      declarations: [ ProductReviewEditComponent ],
      providers: [
        { provide: ProductReviewService, useValue: productReviewService },
        { provide: MAT_DIALOG_DATA, useValue: { productData: {} } },
        { provide: MatDialogRef, useValue: dialogRef }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductReviewEditComponent)
    component = fixture.componentInstance
    component.data = { reviewData: { _id: 42, message: 'Review' } }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should be initialized with data from the passed review', () => {
    component.data = { reviewData: { _id: 42, message: 'Review' } }
    component.ngOnInit()
    expect(component.data).toEqual({ _id: 42, message: 'Review' })
    expect(component.editReviewControl.value).toBe('Review')
  })

  it('should update review through backend API', () => {
    component.data = { reviewData: { _id: 42, message: 'Review' } }
    component.ngOnInit()
    component.editReviewControl.setValue('Another Review')
    component.editReview()
    expect(productReviewService.patch.calls.count()).toBe(1)
    expect(productReviewService.patch.calls.argsFor(0)[0]).toEqual({ id: 42, message: 'Another Review' })
  })

  it('should close the dialog on submitting the edited review', () => {
    productReviewService.patch.and.returnValue(of({}))
    component.data = { reviewData: { _id: 42, message: 'Review' } }
    component.ngOnInit()
    component.editReview()
    expect(dialogRef.close).toHaveBeenCalled()
  })

  it('should log errors directly to browser console', fakeAsync(() => {
    component.data = { reviewData: { _id: 42, message: 'Review' } }
    console.log = jasmine.createSpy('log')
    productReviewService.patch.and.returnValue(throwError('Error'))
    component.ngOnInit()
    component.editReview()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
