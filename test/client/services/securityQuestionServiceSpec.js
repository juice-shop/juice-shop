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

  describe('SecurityQuestionService', function () {
    it('should be defined', inject(function (SecurityQuestionService) {
      expect(SecurityQuestionService).toBeDefined()
      expect(SecurityQuestionService.find).toBeDefined()
      expect(SecurityQuestionService.findBy).toBeDefined()
    }))

    it('should get all challenges directly from the rest api', inject(function (SecurityQuestionService) {
      $httpBackend.whenGET('/api/SecurityQuestions/').respond(200, { data: 'apiResponse' })

      SecurityQuestionService.find().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get security question by user email directly from the rest api', inject(function (SecurityQuestionService) {
      $httpBackend.whenGET(/rest\/user\/security-question\?email=x@y\.z/).respond(200, { question: 'apiResponse' })

      SecurityQuestionService.findBy('x@y.z').then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
