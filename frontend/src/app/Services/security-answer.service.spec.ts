import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { SecurityAnswerService } from './security-answer.service'

describe('SecurityAnswerService', () => {
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SecurityAnswerService]
    })
  })

  it('should be created', inject([SecurityAnswerService], (service: SecurityAnswerService) => {
    expect(service).toBeTruthy()
  }))

  it('should create feedback directly via the rest api', inject([SecurityAnswerService, HttpTestingController],
    fakeAsync((service: SecurityAnswerService, httpMock: HttpTestingController) => {
      let res: any
      service.save(null).subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/api/SecurityAnswers/')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toBeFalsy()
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
