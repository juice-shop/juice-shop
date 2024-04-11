/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ConfigurationService } from './configuration.service'

describe('ConfigurationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigurationService]
    })
  })

  it('should be created', inject([ConfigurationService], (service: ConfigurationService) => {
    expect(service).toBeTruthy()
  }))

  it('should get application configuration directly from the rest api',
    inject([ConfigurationService, HttpTestingController],
      fakeAsync((service: ConfigurationService, httpMock: HttpTestingController) => {
        let res: any
        service.getApplicationConfiguration().subscribe(data => { res = data })

        const req = httpMock.expectOne('http://localhost:3000/rest/admin/application-configuration')
        req.flush({
          config:
            {
              version: '8.0.0',
              showGitHubLinks: false
            }
        })

        tick()

        const data = res
        expect(data.version).toBe('8.0.0')
        expect(data.showGitHubLink).toBeFalsy()

        httpMock.verify()
      })
    ))

  it('should throw an error on recieving an error from the server',
    inject([ConfigurationService, HttpTestingController],
      fakeAsync((service: ConfigurationService, httpMock: HttpTestingController) => {
        let res: any
        service.getApplicationConfiguration().subscribe(data => {
          console.log(data)
        }, (err) => (res = err))
        const req = httpMock.expectOne('http://localhost:3000/rest/admin/application-configuration')
        req.error(new ErrorEvent('Request failed'), { status: 404, statusText: 'Request failed' })
        tick()

        const error = res
        expect(service.getApplicationConfiguration).toThrow()
        expect(error.status).toBe(404)
        expect(error.statusText).toBe('Request failed')
        httpMock.verify()
      })
    ))
})
