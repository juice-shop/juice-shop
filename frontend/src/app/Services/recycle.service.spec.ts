import { TestBed, inject } from '@angular/core/testing'

import { RecycleService } from './recycle.service'
import { HttpClientModule } from '@angular/common/http'

describe('RecycleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [RecycleService]
    })
  })

  it('should be created', inject([RecycleService], (service: RecycleService) => {
    expect(service).toBeTruthy()
  }))
})
