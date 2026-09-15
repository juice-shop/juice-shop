import { TestBed } from '@angular/core/testing'
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

    it('should be created', () => {
        const service = TestBed.inject(VulnLinesService)

        expect(service).toBeTruthy()
    })

    it('should submit solution for "Fit It" phase of coding challenge via the rest api', () => {
        const service = TestBed.inject(VulnLinesService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.check('testChallenge', [1, 2]).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/snippets/verdict')
        req.flush('apiResponse')
        expect(req.request.method).toBe('POST')
        expect(req.request.body).toEqual({ key: 'testChallenge', selectedLines: [1, 2] })
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when submitting solution', () => {
        const service = TestBed.inject(VulnLinesService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.check('key', [3, 4]).subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/snippets/verdict')
        req.error(new ErrorEvent('Request failed'), { status: 400, statusText: 'Bad Request' })
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })
})
