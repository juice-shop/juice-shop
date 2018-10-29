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

  describe('LogoutService', function () {
    it('should be defined', inject(function (LogoutService) {
      expect(LogoutService).toBeDefined()
      expect(LogoutService.save).toBeDefined()
    }))

    it('should store login IP at backend', inject(function (LogoutService) {
      $httpBackend.whenGET('/rest/saveLoginIp').respond(200, 'apiResponse')

      LogoutService.save().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
