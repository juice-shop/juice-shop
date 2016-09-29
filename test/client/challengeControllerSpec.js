describe('controllers', function () {
  var scope, controller, $httpBackend, $sce

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $sce = $injector.get('$sce')
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('ChallengeController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('ChallengeController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.whenGET('/api/Challenges/').respond(200, {data: []})

      $httpBackend.flush()

      expect(controller).toBeDefined()
    }))

    it('should hold existing challenges', inject(function () {
      $httpBackend.whenGET('/api/Challenges/').respond(200, {data: [{description: 'XSS'}, {description: 'CSRF'}]})

      $httpBackend.flush()

      expect(scope.challenges.length).toBe(2)
      expect(scope.challenges[0].description).toBeDefined()
      expect(scope.challenges[1].description).toBeDefined()
    }))

    it('should consider challenge description as trusted HTML', inject(function () {
      $httpBackend.whenGET('/api/Challenges/').respond(200, {data: [{description: '<a src="link">Link</a>'}]})
      spyOn($sce, 'trustAsHtml')

      $httpBackend.flush()

      expect($sce.trustAsHtml).toHaveBeenCalledWith('<a src="link">Link</a>')
    }))

    it('should calculate percent of challenges solved', inject(function () {
      $httpBackend.whenGET('/api/Challenges/').respond(200, {data: [{solved: true}, {solved: true}, {solved: false}]})

      $httpBackend.flush()

      expect(scope.percentChallengesSolved).toBe('67')
    }))

    it('should hold nothing when no challenges exists', inject(function () {
      $httpBackend.whenGET('/api/Challenges/').respond(200, {data: {}})

      $httpBackend.flush()

      expect(scope.challenges).toEqual({})
    }))

    it('should hold nothing on error from backend API', inject(function () {
      $httpBackend.whenGET('/api/Challenges/').respond(500)

      $httpBackend.flush()

      expect(scope.challenges).toBeUndefined()
    }))

    it('should log errors directly to browser console', inject(function () {
      $httpBackend.whenGET('/api/Challenges/').respond(500, 'error')
      console.log = jasmine.createSpy('log')

      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should colorize total score in red for up to 33% challenge completion', inject(function () {
      $httpBackend.whenGET('/api/Challenges/').respond(200, {data: [{solved: true}, {solved: false}, {solved: false}]})

      $httpBackend.flush()

      expect(scope.completionColor).toBe('danger')
    }))

    it('should colorize total score in yellow for more than 33% challenge completion', inject(function () {
      $httpBackend.whenGET('/api/Challenges/').respond(200, {data: [{solved: true}, {solved: false}]})

      $httpBackend.flush()

      expect(scope.completionColor).toBe('warning')
    }))

    it('should colorize total score in green for more than 66% challenge completion', inject(function () {
      $httpBackend.whenGET('/api/Challenges/').respond(200, {data: [{solved: true}, {solved: true}, {solved: false}]})

      $httpBackend.flush()

      expect(scope.completionColor).toBe('success')
    }))
  })
})
