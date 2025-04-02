import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { VulnLinesService } from './vuln-lines.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('VulnLinesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [VulnLinesService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([VulnLinesService], (service: VulnLinesService) => {
    expect(service).toBeTruthy()
  }))

  it('should submit solution for "Fit It" phase of coding challenge via the rest api', inject([VulnLinesService, HttpTestingController],
    fakeAsync((service: VulnLinesService, httpMock: HttpTestingController) => {
      let res: any
      service.check('testChallenge', [1, 2]).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/snippets/verdict')
      req.flush('apiResponse')

      tick()
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ key: 'testChallenge', selectedLines: [1, 2] })
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
