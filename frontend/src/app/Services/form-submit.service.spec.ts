import { inject, TestBed } from '@angular/core/testing'

import { FormSubmitService } from './form-submit.service'

describe('FormSubmitService', () => {
  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [FormSubmitService]
    })
  })

  it('should be created', inject([FormSubmitService], (service: FormSubmitService) => {
    expect(service).toBeTruthy()
  }))
})
