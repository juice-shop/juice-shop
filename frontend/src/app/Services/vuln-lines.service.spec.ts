import { TestBed,inject } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { VulnLinesService } from './vuln-lines.service'


describe('VulnLinesService', () => {
  let service: VulnLinesService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VulnLinesService]
    })
    service = TestBed.inject(VulnLinesService)
  })

  it('should be created', inject([VulnLinesService], (service: VulnLinesService) => {
    expect(service).toBeTruthy()
  }))
})
