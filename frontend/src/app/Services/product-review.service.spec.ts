import { TestBed, inject } from '@angular/core/testing';

import { ProductReviewService } from './product-review.service';
import { HttpClientModule } from '@angular/common/http';

describe('ProductReviewService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [ProductReviewService]
    });
  });

  it('should be created', inject([ProductReviewService], (service: ProductReviewService) => {
    expect(service).toBeTruthy();
  }));
});
