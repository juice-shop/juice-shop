import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { SecurityQuestionService } from './security-question.service'

describe('SecurityQuestionService', () => {
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SecurityQuestionService]
    })
  })

  it('should be created', inject([SecurityQuestionService], (service: SecurityQuestionService) => {
    expect(service).toBeTruthy()
  }))

  it('should get all challenges directly from the rest api', inject([SecurityQuestionService, HttpTestingController],
    fakeAsync((service: SecurityQuestionService, httpMock: HttpTestingController) => {
      let res: any
      service.find(null).subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/api/SecurityQuestions/')
      req.flush({ data: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(req.request.params.toString()).toBeFalsy()
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get security question by user email directly from the rest api', inject([SecurityQuestionService, HttpTestingController],
    fakeAsync((service: SecurityQuestionService, httpMock: HttpTestingController) => {
      let res: any
      service.findBy('x@y.z').subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/rest\/user\/security-question\?email=x@y\.z')
      req.flush({ question: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
