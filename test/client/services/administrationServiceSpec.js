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

  describe('AdministrationService', function () {
    it('should be defined', inject(function (AdministrationService) {
      expect(AdministrationService).toBeDefined()
      expect(AdministrationService.getApplicationVersion).toBeDefined()
    }))

    it('should get application version directly from the rest api', inject(function (AdministrationService) {
      $httpBackend.whenGET('/rest/admin/application-version').respond(200, { version: 'apiResponse' })

      AdministrationService.getApplicationVersion().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get application configuration directly from the rest api', inject(function (ConfigurationService) {
      $httpBackend.whenGET('/rest/admin/application-configuration').respond(200, { config: 'apiResponse' })

      ConfigurationService.getApplicationConfiguration().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
