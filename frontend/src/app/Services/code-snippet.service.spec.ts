/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { CodeSnippetService } from './code-snippet.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('CodeSnippetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [CodeSnippetService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([CodeSnippetService], (service: CodeSnippetService) => {
    expect(service).toBeTruthy()
  }))

  it('should get single snippet directly from the rest api', inject([CodeSnippetService, HttpTestingController],
    fakeAsync((service: CodeSnippetService, httpMock: HttpTestingController) => {
      let res: any
      service.get('testChallenge').subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/snippets/testChallenge')
      req.flush({ snippet: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toEqual({ snippet: 'apiResponse' })
      httpMock.verify()
    })
  ))
})
