import { TestBed } from '@angular/core/testing'

import { VulnLinesService } from './vuln-lines.service'

describe('VulnLinesService', () => {
  let service: VulnLinesService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(VulnLinesService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
