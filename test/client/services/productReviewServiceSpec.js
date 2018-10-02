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

  describe('ProductReviewService', function () {
    it('should be defined', inject(function (ProductReviewService) {
      expect(ProductReviewService).toBeDefined()
      expect(ProductReviewService.get).toBeDefined()
      expect(ProductReviewService.create).toBeDefined()
    }))

    it('should create product reviews directly via the rest api', inject(function (ProductReviewService) {
      $httpBackend.whenPUT('/rest/product/42/reviews').respond(200, { data: 'apiResponse' })

      ProductReviewService.create(42, {}).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should like product reviews directly via the rest api', inject(function (ProductReviewService) {
      $httpBackend.whenPOST('/rest/product/reviews').respond(200, { data: 'apiResponse' })

      ProductReviewService.like({}).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get product reviews directly via the rest api', inject(function (ProductReviewService) {
      $httpBackend.whenGET('/rest/product/42/reviews').respond(200, { data: 'apiResponse' })

      ProductReviewService.get(42).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
