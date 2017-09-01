describe('services', function () {
  var $httpBackend, result

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    result = undefined
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
  })

  describe('UserService', function () {
    it('should be defined', inject(function (UserService) {
      expect(UserService).toBeDefined()
      expect(UserService.find).toBeDefined()
      expect(UserService.get).toBeDefined()
      expect(UserService.changePassword).toBeDefined()
      expect(UserService.whoAmI).toBeDefined()
    }))

    it('should get all users directly from the rest api', inject(function (UserService) {
      $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: 'apiResponse'})

      UserService.find().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get single users directly from the rest api', inject(function (UserService) {
      $httpBackend.whenGET('/api/Users/1').respond(200, {data: 'apiResponse'})

      UserService.get(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should create user directly via the rest api', inject(function (UserService) {
      $httpBackend.whenPOST('/api/Users/').respond(200, {data: 'apiResponse'})

      UserService.save().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should login user directly via the rest api', inject(function (UserService) {
      $httpBackend.whenPOST('/rest/user/login').respond(200, {authentication: 'apiResponse'})

      UserService.login().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should change user password directly via the rest api', inject(function (UserService) {
      $httpBackend.whenGET('/rest/user/change-password?current=foo&new=bar&repeat=bar').respond(200, {user: 'apiResponse'})

      UserService.changePassword({current: 'foo', new: 'bar', repeat: 'bar'}).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should return the logged-in users identity directly from the rest api', inject(function (UserService) {
      $httpBackend.whenGET('/rest/user/whoami').respond(200, {user: 'apiResponse'})

      UserService.whoAmI().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })

  describe('ProductService', function () {
    it('should be defined', inject(function (ProductService) {
      expect(ProductService).toBeDefined()
      expect(ProductService.find).toBeDefined()
      expect(ProductService.get).toBeDefined()
      expect(ProductService.search).toBeDefined()
    }))

    it('should get all products directly from the rest api', inject(function (ProductService) {
      $httpBackend.whenGET('/api/Products/').respond(200, {data: 'apiResponse'})

      ProductService.find().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get single product directly from the rest api', inject(function (ProductService) {
      $httpBackend.whenGET(/\/api\/Products\/1/).respond(200, {data: 'apiResponse'})

      ProductService.get(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })

  describe('FeedbackService', function () {
    it('should be defined', inject(function (FeedbackService) {
      expect(FeedbackService).toBeDefined()
      expect(FeedbackService.find).toBeDefined()
      expect(FeedbackService.save).toBeDefined()
      expect(FeedbackService.del).toBeDefined()
    }))

    it('should get all feedback directly from the rest api', inject(function (FeedbackService) {
      $httpBackend.whenGET('/api/Feedbacks/').respond(200, {data: 'apiResponse'})

      FeedbackService.find().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should delete feedback directly via the rest api', inject(function (FeedbackService) {
      $httpBackend.whenDELETE('/api/Feedbacks/1').respond(200, {data: 'apiResponse'})

      FeedbackService.del(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should create feedback directly via the rest api', inject(function (FeedbackService) {
      $httpBackend.whenPOST('/api/Feedbacks/').respond(200, {data: 'apiResponse'})

      FeedbackService.save().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })

  describe('BasketService', function () {
    it('should be defined', inject(function (BasketService) {
      expect(BasketService).toBeDefined()
      expect(BasketService.find).toBeDefined()
      expect(BasketService.get).toBeDefined()
      expect(BasketService.put).toBeDefined()
      expect(BasketService.del).toBeDefined()
      expect(BasketService.checkout).toBeDefined()
    }))

    it('should get basket directly from the rest api', inject(function (BasketService) {
      $httpBackend.whenGET('/rest/basket/1').respond(200, { data: 'apiResponse' })

      BasketService.find(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get single basket item directly via the rest api', inject(function (BasketService) {
      $httpBackend.whenGET('/api/BasketItems/1').respond(200, { data: 'apiResponse' })

      BasketService.get(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should create basket item directly via the rest api', inject(function (BasketService) {
      $httpBackend.whenPOST('/api/BasketItems/').respond(200, { data: 'apiResponse' })

      BasketService.save().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should update basket item directly via the rest api', inject(function (BasketService) {
      $httpBackend.whenPUT('/api/BasketItems/1').respond(200, { data: 'apiResponse' })

      BasketService.put(1, {}).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should delete basket item directly via the rest api', inject(function (BasketService) {
      $httpBackend.whenDELETE('/api/BasketItems/1').respond(200, { data: 'apiResponse' })

      BasketService.del(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should place order for basket via the rest api', inject(function (BasketService) {
      $httpBackend.whenPOST('/rest/basket/1/checkout').respond(200, { orderConfirmation: 'apiResponse' })

      BasketService.checkout(1).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should apply coupon to basket via the rest api', inject(function (BasketService) {
      $httpBackend.whenPUT('/rest/basket/1/coupon/1234567890').respond(200, { discount: 'apiResponse' })

      BasketService.applyCoupon(1, '1234567890').then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
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

  describe('ComplaintService', function () {
    it('should be defined', inject(function (ComplaintService) {
      expect(ComplaintService).toBeDefined()
      expect(ComplaintService.save).toBeDefined()
    }))

    it('should create complaint directly via the rest api', inject(function (ComplaintService) {
      $httpBackend.whenPOST('/api/Complaints/').respond(200, { data: 'apiResponse' })

      ComplaintService.save().then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
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

  describe('ProductReviewService', function () {
    it('should be defined', inject(function (ProductReviewService) {
      expect(ProductReviewService).toBeDefined()
      expect(ProductReviewService.get).toBeDefined()
      expect(ProductReviewService.create).toBeDefined()
    }))

    it('should create product reviews directly via the rest api', inject(function (ProductReviewService) {
      $httpBackend.whenPUT('/rest/product/42/reviews').respond(200, {data: 'apiResponse'})

      ProductReviewService.create(42, {}).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))

    it('should get product reviews directly via the rest api', inject(function (ProductReviewService) {
      $httpBackend.whenGET('/rest/product/42/reviews').respond(200, {data: 'apiResponse'})

      ProductReviewService.get(42).then(function (data) { result = data })
      $httpBackend.flush()

      expect(result).toBe('apiResponse')
    }))
  })
})
