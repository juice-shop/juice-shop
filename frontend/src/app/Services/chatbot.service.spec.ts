/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { ChatbotService } from './chatbot.service'

describe('ChatbotService', () => {
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChatbotService]
    })
  })

  it('should be created', inject([ChatbotService], (service: ChatbotService) => {
    expect(service).toBeTruthy()
  }))

  it('should get status from the REST API', inject([ChatbotService, HttpTestingController],
    fakeAsync((service: ChatbotService, httpMock: HttpTestingController) => {
      let res: any
      service.getChatbotStatus().subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/rest/chatbot/status')
      req.flush({ status: true, body: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('GET')
      expect(req.request.body).toBeNull()
      expect(res.status).toBeTrue()
      expect(res.body).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get query response from the REST API', inject([ChatbotService, HttpTestingController],
    fakeAsync((service: ChatbotService, httpMock: HttpTestingController) => {
      let res: any
      service.getResponse('query', 'apiQuery').subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/rest/chatbot/respond')
      req.flush({ action: 'response', body: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('POST')
      expect(req.request.body.query).toBe('apiQuery')
      expect(res.action).toBe('response')
      expect(res.body).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
