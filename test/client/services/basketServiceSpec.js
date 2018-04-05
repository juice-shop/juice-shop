describe('services', function () {
  var $httpBackend, result

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    result = undefined
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
  })

  describe('BasketService', function () {
    it('should be defined', inject(function (BasketService) {
      expect(BasketService).toBeDefined()
      expect(BasketService.find).toBeDefined()
      expect(BasketService.get).toBeDefined()
      expect(BasketService.put).toBeDefined()
      expect(BasketService.del).toBeDefined()
      expect(BasketService.checkout).toBeDefined()
    }))

    it('should get basket directly from the rest api', inject(function (BasketService) {
      $httpBackend.whenGET('/rest/basket/1').respond(200, { data: 'apiResponse' })

      BasketService.find(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get single basket item directly via the rest api', inject(function (BasketService) {
      $httpBackend.whenGET('/api/BasketItems/1').respond(200, { data: 'apiResponse' })

      BasketService.get(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should create basket item directly via the rest api', inject(function (BasketService) {
      $httpBackend.whenPOST('/api/BasketItems/').respond(200, { data: 'apiResponse' })

      BasketService.save().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should update basket item directly via the rest api', inject(function (BasketService) {
      $httpBackend.whenPUT('/api/BasketItems/1').respond(200, { data: 'apiResponse' })

      BasketService.put(1, {}).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should delete basket item directly via the rest api', inject(function (BasketService) {
      $httpBackend.whenDELETE('/api/BasketItems/1').respond(200, { data: 'apiResponse' })

      BasketService.del(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should place order for basket via the rest api', inject(function (BasketService) {
      $httpBackend.whenPOST('/rest/basket/1/checkout').respond(200, { orderConfirmation: 'apiResponse' })

      BasketService.checkout(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should apply coupon to basket via the rest api', inject(function (BasketService) {
      $httpBackend.whenPUT('/rest/basket/1/coupon/1234567890').respond(200, { discount: 'apiResponse' })

      BasketService.applyCoupon(1, '1234567890').then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
