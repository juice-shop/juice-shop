describe('controllers', function () {
  var scope, controller, $httpBackend, $sce

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $sce = $injector.get('$sce')
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('FeedbackController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('FeedbackController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.whenGET('/api/Feedbacks/').respond(200, { data: [] })

      $httpBackend.flush()

      expect(controller).toBeDefined()
      expect(scope.delete).toBeDefined()
    }))

    it('should hold existing feedback', inject(function () {
      $httpBackend.whenGET('/api/Feedbacks/').respond(200, { data: [{ comment: 'a' }, { comment: 'b' }] })

      $httpBackend.flush()

      expect(scope.feedbacks.length).toBe(2)
      expect(scope.feedbacks[0].comment).toBeDefined()
      expect(scope.feedbacks[1].comment).toBeDefined()
    }))

    it('should add an image to feedback', inject(function () {
      $httpBackend.whenGET('/api/Feedbacks/').respond(200, { data: [{}] })

      $httpBackend.flush()

      expect(scope.feedbacks[0].image).toBeDefined()
    }))

    it('should cycle through images if more feedback than images exists', inject(function () {
      $httpBackend.whenGET('/api/Feedbacks/').respond(200, { data: [{}, {}, {}, {}, {}, {}, {}, {}, {}] })

      $httpBackend.flush()

      expect(scope.feedbacks[7].image).toBe(scope.feedbacks[0].image)
      expect(scope.feedbacks[8].image).toBe(scope.feedbacks[1].image)
    }))

    it('should consider feedback comment as trusted HTML', inject(function () {
      $httpBackend.whenGET('/api/Feedbacks/').respond(200, { data: [{ comment: '<script>alert("XSS")</script>' }] })
      spyOn($sce, 'trustAsHtml')

      $httpBackend.flush()

      expect($sce.trustAsHtml).toHaveBeenCalledWith('<script>alert("XSS")</script>')
    }))

    it('should hold nothing when no feedback exists', inject(function () {
      $httpBackend.whenGET('/api/Feedbacks/').respond(200, { data: {} })

      $httpBackend.flush()

      expect(scope.feedbacks).toEqual({})
    }))

    it('should hold nothing on error from backend API', inject(function () {
      $httpBackend.whenGET('/api/Feedbacks/').respond(500)

      $httpBackend.flush()

      expect(scope.feedbacks).toBeUndefined()
    }))

    it('should log error from backend API directly to browser console', inject(function () {
      $httpBackend.whenGET('/api/Feedbacks/').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should pass delete request for feedback to backend API', inject(function () {
      $httpBackend.whenGET('/api/Feedbacks/').respond(200, { data: [{ id: 42 }] })
      $httpBackend.whenDELETE('/api/Feedbacks/42').respond(200, { data: {} })

      scope.delete(42)
      $httpBackend.flush()
    }))

    it('should reload Feedback list after deleting a Feedback', inject(function () {
      $httpBackend.expectGET('/api/Feedbacks/').respond(200, { data: [{ id: 42 }, { id: 43 }] })
      $httpBackend.whenDELETE('/api/Feedbacks/42').respond(200, { data: {} })
      $httpBackend.expectGET('/api/Feedbacks/').respond(200, { data: [{ id: 42 }] })

      scope.delete(42)
      $httpBackend.flush()
    }))

    it('should log error while deleting feedback directly to browser console', inject(function () {
      $httpBackend.whenGET('/api/Feedbacks/').respond(200, { data: [{ id: 42 }] })
      $httpBackend.whenDELETE('/api/Feedbacks/4711').respond(500, 'error')

      console.log = jasmine.createSpy('log')

      scope.delete(4711)
      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))
  })
})
