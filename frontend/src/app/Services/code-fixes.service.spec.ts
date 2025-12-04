import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { CodeFixesService } from './code-fixes.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('CodeFixesService', () => {
  let service: CodeFixesService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [CodeFixesService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
    service = TestBed.inject(CodeFixesService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should get fixes directly from the rest api', inject([CodeFixesService, HttpTestingController],
    fakeAsync((service: CodeFixesService, httpMock: HttpTestingController) => {
      let res: any
      service.get('testKey').subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/snippets/fixes/testKey')
      req.flush('apiResponse')
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should handle error when getting fixes', inject([CodeFixesService, HttpTestingController],
    fakeAsync((service: CodeFixesService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.get('testKey').subscribe({ next: () => {}, error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/snippets/fixes/testKey')
      req.flush(null, { status: 500, statusText: 'Server Error' })

      tick()
      expect(capturedError).toBeTruthy()
      expect(capturedError.status).toBe(500)
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
