describe('controllers', function () {
  var scope, controller, $httpBackend, $sce

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/.*application-configuration/).respond(200, {'config': {'application': {'showCtfFlagsInNotifications': true, 'showChallengeSolvedNotifications': true}}})
    $sce = $injector.get('$sce')
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('ChallengeController', function () {
    beforeEach(inject(function ($rootScope, $cookies, $controller) {
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

      it('should colorize total score in red for less than 25% challenge completion', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true }, { solved: false }, { solved: false }, { solved: false }, { solved: false } ] })

        $httpBackend.flush()

        expect(scope.completionColor).toBe('danger')
      }))

      it('should colorize total score in red for exactly 25% challenge completion', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true }, { solved: false }, { solved: false }, { solved: false } ] })

        $httpBackend.flush()

        expect(scope.completionColor).toBe('danger')
      }))

      it('should colorize total score in yellow for more than 25% challenge completion', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true }, { solved: false } ] })

        $httpBackend.flush()

        expect(scope.completionColor).toBe('warning')
      }))

      it('should colorize total score in yellow for exactly 75% challenge completion', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true }, { solved: true }, { solved: true }, { solved: false } ] })

        $httpBackend.flush()

        expect(scope.completionColor).toBe('warning')
      }))

      it('should colorize total score in green for more than 75% challenge completion', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true }, { solved: true }, { solved: true }, { solved: true }, { solved: false } ] })

        $httpBackend.flush()

        expect(scope.completionColor).toBe('success')
      }))

      it('should colorize total score in green for exactly 100% challenge completion', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true } ] })

        $httpBackend.flush()

        expect(scope.completionColor).toBe('success')
      }))
    })

    describe('live updates', function () {
      var socket

      beforeEach(inject(function (_socket_) {
        socket = _socket_
        $httpBackend.whenGET('/rest/continue-code').respond(200, {})
        $httpBackend.whenGET('/api/Challenges/').respond(200, {
          data: [
            {name: 'Challenge #1', solved: false},
            {name: 'Challenge #2', solved: false}
          ]
        })
        $httpBackend.flush()
      }))

      it('should update the correct challenge when a challenge solved event occurs', inject(function () {
        socket.receive('challenge solved', { challenge: 'ping', name: 'Challenge #1' })
        expect(scope.challenges[ 0 ].solved).toBe(true)
        expect(scope.challenges[ 1 ].solved).toBe(false)
      }))

      it('should not update when a challenge solved event to a nonexistent challenge occurs', inject(function () {
        socket.receive('challenge solved', { challenge: 'ping', name: 'Challenge #1337' })
        expect(scope.challenges[ 0 ].solved).toBe(false)
        expect(scope.challenges[ 1 ].solved).toBe(false)
      }))
    })

    describe('repeat notification', function () {
      beforeEach(inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, {
          data: [
            {name: 'Challenge #1', solved: true},
            {name: 'Challenge #2', solved: false}
          ]
        })
      }))

      it('should be possible when challenge-solved notifications are shown with CTF flag codes', inject(function () {
        $httpBackend.expectGET(/.*application-configuration/).respond(200, {'config': {'application': {'showCtfFlagsInNotifications': true, 'showChallengeSolvedNotifications': true}}})
        $httpBackend.flush()
        expect(scope.allowRepeatNotifications).toBe(true)
      }))

      it('should not be possible when challenge-solved notifications are shown without CTF flag codes', inject(function () {
        $httpBackend.expectGET(/.*application-configuration/).respond(200, {'config': {'application': {'showCtfFlagsInNotifications': false, 'showChallengeSolvedNotifications': true}}})
        $httpBackend.flush()
        expect(scope.allowRepeatNotifications).toBe(false)
      }))

      it('should not be possible when challenge-solved notifications are not shown', inject(function () {
        $httpBackend.expectGET(/.*application-configuration/).respond(200, {'config': {'application': {'showChallengeSolvedNotifications': false}}})
        $httpBackend.flush()
        expect(scope.allowRepeatNotifications).toBe(false)
      }))
    })
  })
})
