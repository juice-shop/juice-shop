import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { DeliveryService } from './delivery.service'

describe('DeliveryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeliveryService]
    })
  })

  it('should be created', inject([DeliveryService], (service: DeliveryService) => {
    expect(service).toBeTruthy()
  }))

  it('should get address directly from the api', inject([DeliveryService, HttpTestingController],
    fakeAsync((service: DeliveryService, httpMock: HttpTestingController) => {
      let res
      service.get().subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/api/Deliverys')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
