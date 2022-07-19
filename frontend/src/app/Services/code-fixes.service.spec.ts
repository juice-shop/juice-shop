import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { CodeFixesService } from './code-fixes.service'

describe('CodeFixesService', () => {
  let service: CodeFixesService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CodeFixesService]
    })
    service = TestBed.inject(CodeFixesService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should get code fixes for challenge directly from the rest api', inject([CodeFixesService, HttpTestingController],
    fakeAsync((service: CodeFixesService, httpMock: HttpTestingController) => {
      let res: any
      service.get('testChallenge').subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/snippets/fixes/testChallenge')
      req.flush({ snippet: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toEqual({ snippet: 'apiResponse' })
      httpMock.verify()
    })
  ))

  it('should submit solution for "Fit It" phase of coding challenge via the rest api', inject([CodeFixesService, HttpTestingController],
    fakeAsync((service: CodeFixesService, httpMock: HttpTestingController) => {
      let res: any
      service.check('testChallenge', 1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/snippets/fixes')
      req.flush('apiResponse')

      tick()
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ key: 'testChallenge', selectedFix: 1 })
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
