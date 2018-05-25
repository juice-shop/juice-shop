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

  describe('TrackOrderService', function () {
    it('should be defined', inject(function (TrackOrderService) {
      expect(TrackOrderService).toBeDefined()
      expect(TrackOrderService.save).toBeDefined()
    }))

    it('should get tracking order results directly via the rest api', inject(function (TrackOrderService) {
      $httpBackend.whenGET('/rest/track-order/5267-f9cd5882f54c75a3').respond(200, 'apiResponse')

      TrackOrderService.save('5267-f9cd5882f54c75a3').then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
