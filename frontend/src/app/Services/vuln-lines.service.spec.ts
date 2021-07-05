import { TestBed, inject } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { VulnLinesService } from './vuln-lines.service'

describe('VulnLinesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VulnLinesService]
    })
  })

  it('should be created', inject([VulnLinesService], (service: VulnLinesService) => {
    expect(service).toBeTruthy()
  }))
})
