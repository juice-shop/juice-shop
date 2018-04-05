describe('controllers', function () {
  var scope, controller, window, $httpBackend, $sce

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
    $httpBackend.whenGET(/.*application-configuration/).respond(200, {'config': {'application': {'showCtfFlagsInNotifications': true, 'showChallengeSolvedNotifications': true}}})
    $sce = $injector.get('$sce')
  }))

  afterEach(function () {
    // $httpBackend.verifyNoOutstandingExpectation()
    // $httpBackend.verifyNoOutstandingRequest()
  })

  describe('ChallengeController', function () {
    beforeEach(inject(function ($rootScope, $cookies, $window, $controller) {
      scope = $rootScope.$new()
      window = $window
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

      it('should complete a level when all challenges of that difficulty are solved', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, { data: [ { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 } ] })

        $httpBackend.flush()

        expect(scope.offsetValue[2]).toBe('0%')
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

      it('should show notification for selected challenge when enabled', inject(function () {
        $httpBackend.expectGET(/.*application-configuration/).respond(200, {'config': {'application': {'showCtfFlagsInNotifications': true, 'showChallengeSolvedNotifications': true}}})
        $httpBackend.flush()
        $httpBackend.expectGET('/rest/repeat-notification?challenge=Challenge%2520%25231').respond(200)

        scope.repeatNotification({name: 'Challenge #1', solved: true})
        $httpBackend.flush()
      }))

      it('should scroll to top of screen when notification is repeated', inject(function () {
        $httpBackend.expectGET(/.*application-configuration/).respond(200, {'config': {'application': {'showCtfFlagsInNotifications': true, 'showChallengeSolvedNotifications': true}}})
        $httpBackend.flush()
        $httpBackend.whenGET('/rest/repeat-notification?challenge=Challenge%2520%25231').respond(200)
        window.scrollTo = jasmine.createSpy('scrollTo')

        scope.repeatNotification({name: 'Challenge #1', solved: true})
        $httpBackend.flush()

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
      }))
    })

    describe('open hint', function () {
      beforeEach(inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, {
          data: [
            {name: 'Challenge #1', hintUrl: 'hint://c1.test'},
            {name: 'Challenge #2'}
          ]
        })
      }))

      it('should happen when challenge has a hint URL', inject(function () {
        $httpBackend.expectGET(/.*application-configuration/).respond(200, {'config': {'application': {'showChallengeHints': true}}})
        $httpBackend.flush()
        window.open = jasmine.createSpy('open')

        scope.openHint({name: 'Challenge #1', hintUrl: 'hint://c1.test'})

        expect(window.open).toHaveBeenCalledWith('hint://c1.test', '_blank')
      }))

      it('should not happen when challenge has no hint URL', inject(function () {
        $httpBackend.expectGET(/.*application-configuration/).respond(200, {'config': {'application': {'showChallengeHints': true}}})
        $httpBackend.flush()
        window.open = jasmine.createSpy('open')

        scope.openHint({name: 'Challenge #2'})

        expect(window.open).not.toHaveBeenCalled()
      }))

      it('should not happen when hints are not turned on in configuration', inject(function () {
        $httpBackend.expectGET(/.*application-configuration/).respond(200, {'config': {'application': {'showChallengeHints': false}}})
        $httpBackend.flush()
        window.open = jasmine.createSpy('open')

        scope.openHint({name: 'Challenge #1', hintUrl: 'hint://c1.test'})

        expect(window.open).not.toHaveBeenCalled()
      }))
    })

    describe('hint text', function () {
      beforeEach(inject(function () {
        $httpBackend.whenGET(/.*application-configuration/).respond(200, {'config': {'application': {'showChallengeHints': true}}})
      }))

      it('should be empty for challenge with neither hint text nor URL', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, {
          data: [
            {name: 'Challenge'}
          ]
        })
        $httpBackend.flush()

        expect(scope.challenges[0].hint).toBeUndefined()
      }))

      it('should remain unchanged for challenge with a hint text but no hint URL', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, {
          data: [
            {name: 'Challenge', hint: 'Hint'}
          ]
        })
        $httpBackend.flush()

        expect(scope.challenges[0].hint).toBe('Hint')
      }))

      it('should append click-me text for challenge with a hint text and URL', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, {
          data: [
            {name: 'Challenge', hint: 'Hint.', hintUrl: 'http://hi.nt'}
          ]
        })
        $httpBackend.flush()

        expect(scope.challenges[0].hint).toBe('Hint. Click for more hints.')
      }))

      it('should become click-me text for challenge without a hint text but with hint URL', inject(function () {
        $httpBackend.whenGET('/api/Challenges/').respond(200, {
          data: [
            {name: 'Challenge', hintUrl: 'http://hi.nt'}
          ]
        })
        $httpBackend.flush()

        expect(scope.challenges[0].hint).toBe('Click to open hints.')
      }))
    })
  })
})
