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

  describe('FeedbackService', function () {
    it('should be defined', inject(function (FeedbackService) {
      expect(FeedbackService).toBeDefined()
      expect(FeedbackService.find).toBeDefined()
      expect(FeedbackService.save).toBeDefined()
      expect(FeedbackService.del).toBeDefined()
    }))

    it('should get all feedback directly from the rest api', inject(function (FeedbackService) {
      $httpBackend.whenGET('/api/Feedbacks/').respond(200, { data: 'apiResponse' })

      FeedbackService.find().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should delete feedback directly via the rest api', inject(function (FeedbackService) {
      $httpBackend.whenDELETE('/api/Feedbacks/1').respond(200, { data: 'apiResponse' })

      FeedbackService.del(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should create feedback directly via the rest api', inject(function (FeedbackService) {
      $httpBackend.whenPOST('/api/Feedbacks/').respond(200, { data: 'apiResponse' })

      FeedbackService.save().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
