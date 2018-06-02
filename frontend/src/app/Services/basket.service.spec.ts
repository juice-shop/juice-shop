import { TestBed, inject } from '@angular/core/testing'

import { BasketService } from './basket.service'
import { HttpClientModule } from '@angular/common/http'

describe('BasketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [BasketService]
    })
  })

  it('should be created', inject([BasketService], (service: BasketService) => {
    expect(service).toBeTruthy()
  }))
})
