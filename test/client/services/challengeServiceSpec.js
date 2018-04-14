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

  describe('ChallengeService', function () {
    it('should be defined', inject(function (ChallengeService) {
      expect(ChallengeService).toBeDefined()
      expect(ChallengeService.find).toBeDefined()
      expect(ChallengeService.continueCode).toBeDefined()
      expect(ChallengeService.restoreProgress).toBeDefined()
    }))

    it('should get all challenges directly from the rest api', inject(function (ChallengeService) {
      $httpBackend.whenGET('/api/Challenges/').respond(200, { data: 'apiResponse' })

      ChallengeService.find().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get current continue code directly from the rest api', inject(function (ChallengeService) {
      $httpBackend.whenGET('/rest/continue-code').respond(200, { continueCode: 'apiResponse' })

      ChallengeService.continueCode().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should pass continue code for restoring challenge progress on to the rest api', inject(function (ChallengeService) {
      $httpBackend.expectPUT('/rest/continue-code/apply/CODE').respond(200)

      ChallengeService.restoreProgress('CODE')
      $httpBackend.flush()
    }))
  })
})
