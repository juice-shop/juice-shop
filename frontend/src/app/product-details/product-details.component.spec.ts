import { ProductReviewEditComponent } from './../product-review-edit/product-review-edit.component'
import { By } from '@angular/platform-browser'
import { MatDividerModule } from '@angular/material/divider'
import { UserService } from './../Services/user.service'
import { ProductReviewService } from '../Services/product-review.service'
import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog'
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'

import { ProductDetailsComponent } from './product-details.component'
import { of, throwError } from 'rxjs'
import { ReactiveFormsModule } from '@angular/forms'

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent
  let fixture: ComponentFixture<ProductDetailsComponent>
  let userService
  let productReviewService
  let dialog
  let dialogRefMock

  beforeEach(async(() => {

    userService = jasmine.createSpyObj('UserService',['whoAmI'])
    userService.whoAmI.and.returnValue(of({}))
    productReviewService = jasmine.createSpyObj('ProductReviewService',['get','create'])
    productReviewService.get.and.returnValue(of([]))
    productReviewService.create.and.returnValue(of({}))
    dialog = jasmine.createSpyObj('Dialog',['open'])
    dialogRefMock = {
      afterClosed:  () => of({})
    }
    dialog.open.and.returnValue(dialogRefMock)

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDividerModule
      ],
      declarations: [ ProductDetailsComponent ],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: ProductReviewService, useValue: productReviewService },
        { provide: MatDialog, useValue: dialog },
        { provide: MAT_DIALOG_DATA, useValue: { productData: {} } }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold single product with given id', () => {
    component.data = { productData: { name: 'Test Juice' } }
    component.ngOnInit()
    expect(component.data).toBeDefined()
    expect(component.data.name).toBe('Test Juice')
  })

  it('should post anonymous review if no user email is returned', () => {
    component.data = { productData: { id: 42 } }
    userService.whoAmI.and.returnValue(of({}))
    component.ngOnInit()
    const textArea: HTMLTextAreaElement = fixture.debugElement.query(By.css('textarea')).nativeElement
    textArea.value = 'Great product!'
    const buttonDe = fixture.debugElement.query(By.css('#submitButton'))
    buttonDe.triggerEventHandler('click',null)
    const reviewObject = { message: 'Great product!', author: 'Anonymous' }
    expect(productReviewService.create.calls.count()).toBe(1)
    expect(productReviewService.create.calls.argsFor(0)[0]).toBe(42)
    expect(productReviewService.create.calls.argsFor(0)[1]).toEqual(reviewObject)
  })

  it('should post review with user email as author', () => {
    component.data = { productData: { id: 42 } }
    userService.whoAmI.and.returnValue(of({ email: 'horst@juice-sh.op' }))
    component.ngOnInit()
    const textArea: HTMLTextAreaElement = fixture.debugElement.query(By.css('textarea')).nativeElement
    textArea.value = 'Great product!'
    const buttonDe = fixture.debugElement.query(By.css('#submitButton'))
    buttonDe.triggerEventHandler('click',null)
    const reviewObject = { message: 'Great product!', author: 'horst@juice-sh.op' }
    expect(productReviewService.create.calls.count()).toBe(1)
    expect(productReviewService.create.calls.argsFor(0)[0]).toBe(42)
    expect(productReviewService.create.calls.argsFor(0)[1]).toEqual(reviewObject)
  })

  it('should log errors when retrieving user directly to browser console', fakeAsync(() => {
    component.data = { productData: { id: 42 } }
    userService.whoAmI.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log errors when posting review directly to browser console', fakeAsync(() => {
    component.data = { productData: { id: 42 } }
    userService.whoAmI.and.returnValue(of({}))
    productReviewService.create.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    const textArea: HTMLTextAreaElement = fixture.debugElement.query(By.css('textarea')).nativeElement
    textArea.value = 'Great product!'
    const buttonDe = fixture.debugElement.query(By.css('#submitButton'))
    buttonDe.triggerEventHandler('click',null)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should refresh reviews after posting a review', () => {
    component.data = { productData: { id: 42 } }
    productReviewService.create.and.returnValue(of({}))
    productReviewService.get.and.returnValue(of([{ message: 'Review 1' ,author: 'Anonymous' }]))
    userService.whoAmI.and.returnValue(of({}))
    component.ngOnInit()
    const textArea: HTMLTextAreaElement = fixture.debugElement.query(By.css('textarea')).nativeElement
    textArea.value = 'Great product!'
    const buttonDe = fixture.debugElement.query(By.css('#submitButton'))
    buttonDe.triggerEventHandler('click',null)
    expect(productReviewService.create).toHaveBeenCalled()
    expect(productReviewService.get).toHaveBeenCalled()
  })

  it('should open a modal dialog with review editor', () => {
    component.data = { productData: { id: 42 } }
    userService.whoAmI.and.returnValue(of({ email: 'horst@juice-sh.op' }))
    productReviewService.get.and.returnValue(of([{ message: 'Great product!', author: 'horst@juice-sh.op' }]))
    component.ngOnInit()
    fixture.detectChanges()
    const buttonDe = fixture.debugElement.query(By.css('button.review-button'))
    buttonDe.triggerEventHandler('click',null)
    expect(dialog.open.calls.count()).toBe(1)
    expect(dialog.open.calls.argsFor(0)[0]).toBe(ProductReviewEditComponent)
    expect(dialog.open.calls.argsFor(0)[1].data).toEqual({ reviewData: { message: 'Great product!', author: 'horst@juice-sh.op' } })
  })

  it('should refresh reviews of product after editing a review', () => {
    component.data = { productData: { id: 42 } }
    userService.whoAmI.and.returnValue(of({ email: 'horst@juice-sh.op' }))
    productReviewService.get.and.returnValue(of([{ message: 'Great product!', author: 'horst@juice-sh.op' }]))
    component.ngOnInit()
    fixture.detectChanges()
    const buttonDe = fixture.debugElement.query(By.css('button.review-button'))
    buttonDe.triggerEventHandler('click',null)
    expect(productReviewService.get).toHaveBeenCalledWith(42)
  })
})
