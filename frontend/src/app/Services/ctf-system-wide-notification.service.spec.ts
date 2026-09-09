/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { CtfSystemWideNotificationService, type SystemWideNotificationResponse } from './ctf-system-wide-notification.service'

describe('CtfSystemWideNotificationService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CtfSystemWideNotificationService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should fetch the system-wide notification from the configured URL', () => {
        const service = TestBed.inject(CtfSystemWideNotificationService)
        const httpMock = TestBed.inject(HttpTestingController)
        const expected: SystemWideNotificationResponse = {
            message: 'System maintenance',
            enabled: true,
            updatedAt: '2026-01-01T00:00:00Z'
        }
        let response: SystemWideNotificationResponse | undefined

        service.fetchNotification('http://example.com/notify').subscribe((data) => { response = data })

        const request = httpMock.expectOne('http://example.com/notify')
        expect(request.request.method).toBe('GET')
        request.flush(expected)

        expect(response).toEqual(expected)
        httpMock.verify()
    })
})
