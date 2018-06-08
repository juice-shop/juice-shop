import { HttpClientModule } from '@angular/common/http'
import { TestBed, inject } from '@angular/core/testing'

import { ChallengeService } from './challenge.service'

describe('ChallengeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports : [
        HttpClientModule
      ],
      providers: [ChallengeService]
    })
  })

  it('should be created', inject([ChallengeService], (service: ChallengeService) => {
    expect(service).toBeTruthy()
  }))
})
