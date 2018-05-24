import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { SecurityAnswerService } from './security-answer.service';

describe('SecurityAnswerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [SecurityAnswerService]
    });
  });

  it('should be created', inject([SecurityAnswerService], (service: SecurityAnswerService) => {
    expect(service).toBeTruthy();
  }));
});
