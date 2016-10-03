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
      $httpBackend.whenGET('/rest/continue-code').respond(200, {})
      $httpBackend.whenGET('/api/Challenges/').respond(200, {data: []})

      $httpBackend.flush()

      expect(controller).toBeDefined()
      expect(scope.restoreProgress).toBeDefined()
    }))

    describe('loading challenges', function () {
      beforeEach(inject(function ($httpBackend) {
        $httpBackend.whenGET('/rest/continue-code').respond(200, {})
      }))

      it('should hold existing challenges', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { description: 'XSS' }, { description: 'CSRF' } ] })

        $httpBackend.flush()

        expect(scope.challenges.length).toBe(2)
        expect(scope.challenges[ 0 ].description).toBeDefined()
        expect(scope.challenges[ 1 ].description).toBeDefined()
      }))

      it('should consider challenge description as trusted HTML', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { description: '<a src="link">Link</a>' } ] })
        spyOn($sce, 'trustAsHtml')

        $httpBackend.flush()

        expect($sce.trustAsHtml).toHaveBeenCalledWith('<a src="link">Link</a>')
      }))

      it('should calculate percent of challenges solved', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true }, { solved: true }, { solved: false } ] })

        $httpBackend.flush()

        expect(scope.percentChallengesSolved).toBe('67')
      }))

      it('should hold nothing when no challenges exists', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: {} })

        $httpBackend.flush()

        expect(scope.challenges).toEqual({})
      }))

      it('should hold nothing on error from backend API', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(500)

        $httpBackend.flush()

        expect(scope.challenges).toBeUndefined()
      }))

      it('should log challenge retrieval errors directly to browser console', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(500, 'error')
        console.log = jasmine.createSpy('log')

        $httpBackend.flush()

        expect(console.log).toHaveBeenCalledWith('error')
      }))

      it('should colorize total score in red for up to 33% challenge completion', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true }, { solved: false }, { solved: false } ] })

        $httpBackend.flush()

        expect(scope.completionColor).toBe('danger')
      }))

      it('should colorize total score in yellow for more than 33% challenge completion', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true }, { solved: false } ] })

        $httpBackend.flush()

        expect(scope.completionColor).toBe('warning')
      }))

      it('should colorize total score in green for more than 66% challenge completion', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true }, { solved: true }, { solved: false } ] })

        $httpBackend.flush()

        expect(scope.completionColor).toBe('success')
      }))
    })

    describe('loading current continue code', function () {
      beforeEach(inject(function ($httpBackend) {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [] })
      }))

      it('should hold current continue code', inject(function () {
        $httpBackend.whenGET('/rest/continue-code').respond(200, { continueCode: 'CODE' })

        $httpBackend.flush()

        expect(scope.currentContinueCode).toBe('CODE')
      }))

      it('should log continue code retrieval errors directly to browser console', inject(function () {
        $httpBackend.whenGET('/rest/continue-code').respond(500, 'error')
        console.log = jasmine.createSpy('log')

        $httpBackend.flush()

        expect(console.log).toHaveBeenCalledWith('error')
      }))
    })

    describe('restoring progress', function () {
      beforeEach(inject(function ($httpBackend) {
        scope.form = {$setPristine: function () {}}
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [] })
        $httpBackend.whenGET('/rest/continue-code').respond(200, {})
      }))

      it('should clear and collapse form after successful restore', inject(function () {
        $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(200)

        scope.continueCode = 'CODE'
        scope.restoreProgress()
        $httpBackend.flush()

        expect(scope.continueCode).toBeUndefined()
        expect(scope.continueCollapsed).toBe(true)
      }))

      it('should log errors applying continue code directly to browser console', inject(function () {
        $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(500, 'error')
        console.log = jasmine.createSpy('log')

        scope.continueCode = 'CODE'
        scope.restoreProgress()
        $httpBackend.flush()

        expect(console.log).toHaveBeenCalledWith('error')
      }))

      it('should set error message after failed restore', inject(function () {
        $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(500)

        scope.continueCode = 'CODE'
        scope.restoreProgress()
        $httpBackend.flush()

        expect(scope.error).toBe('INVALID_CONTINUE_CODE')
      }))
    })
  })
})
