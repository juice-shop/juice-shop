import { TestBed, inject } from '@angular/core/testing'

import { TrackOrderService } from './track-order.service'
import { HttpClientModule } from '@angular/common/http'

describe('TrackOrderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [TrackOrderService]
    })
  })

  it('should be created', inject([TrackOrderService], (service: TrackOrderService) => {
    expect(service).toBeTruthy()
  }))
})
