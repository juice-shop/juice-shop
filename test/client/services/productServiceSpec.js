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

  describe('ProductService', function () {
    it('should be defined', inject(function (ProductService) {
      expect(ProductService).toBeDefined()
      expect(ProductService.find).toBeDefined()
      expect(ProductService.get).toBeDefined()
      expect(ProductService.search).toBeDefined()
    }))

    it('should get all products directly from the rest api', inject(function (ProductService) {
      $httpBackend.whenGET('/api/Products/').respond(200, { data: 'apiResponse' })

      ProductService.find().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get single product directly from the rest api', inject(function (ProductService) {
      $httpBackend.whenGET(/\/api\/Products\/1/).respond(200, { data: 'apiResponse' })

      ProductService.get(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
