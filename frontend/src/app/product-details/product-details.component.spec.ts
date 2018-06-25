import { MatDividerModule } from '@angular/material/divider'
import { UserService } from './../Services/user.service'
import { ProductReviewService } from '../Services/product-review.service'
import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ProductDetailsComponent } from './product-details.component'

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent
  let fixture: ComponentFixture<ProductDetailsComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDividerModule
      ],
      declarations: [ ProductDetailsComponent ],
      providers: [
        UserService,
        ProductReviewService,
        { provide: MatDialogRef, useValue: {} },
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

  xit('should create', () => {
    expect(component).toBeTruthy()
  })
})
