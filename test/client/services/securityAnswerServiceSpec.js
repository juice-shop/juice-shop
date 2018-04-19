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

  describe('SecurityAnswerService', function () {
    it('should be defined', inject(function (SecurityAnswerService) {
      expect(SecurityAnswerService).toBeDefined()
      expect(SecurityAnswerService.save).toBeDefined()
    }))

    it('should create feedback directly via the rest api', inject(function (SecurityAnswerService) {
      $httpBackend.whenPOST('/api/SecurityAnswers/').respond(200, {data: 'apiResponse'})

      SecurityAnswerService.save().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
