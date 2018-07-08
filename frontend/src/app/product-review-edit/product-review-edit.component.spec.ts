import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ProductReviewEditComponent } from './product-review-edit.component'

describe('ProductReviewEditComponent', () => {
  let component: ProductReviewEditComponent
  let fixture: ComponentFixture<ProductReviewEditComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductReviewEditComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductReviewEditComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  xit('should create', () => {
    expect(component).toBeTruthy()
  })
})
