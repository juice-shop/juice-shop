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

  describe('RecycleService', function () {
    it('should be defined', inject(function (RecycleService) {
      expect(RecycleService).toBeDefined()
      expect(RecycleService.find).toBeDefined()
      expect(RecycleService.save).toBeDefined()
    }))

    it('should create recycle directly via the rest api', inject(function (RecycleService) {
      $httpBackend.whenPOST('/api/Recycles/').respond(200, { data: 'apiResponse' })

      RecycleService.save().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
