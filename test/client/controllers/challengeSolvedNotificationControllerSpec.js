describe('controllers', function () {
  var scope, socket, controller, $httpBackend, cookies

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET('/rest/continue-code').respond(200, {continueCode: 'totallyAValidCode'})
    $httpBackend.whenGET(/.*application-configuration/).respond(200, {'config': {'application': {'showCtfFlagsInNotifications': true}}})
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('ChallengeSolvedNotificationController', function () {
    beforeEach(inject(function ($rootScope, $controller, $cookies, _socket_) {
      scope = $rootScope.$new()
      socket = _socket_
      cookies = $cookies
      controller = $controller('ChallengeSolvedNotificationController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.flush()
      expect(controller).toBeDefined()
      expect(scope.notifications).toBeDefined()
      expect(scope.closeNotification).toBeDefined()
    }))

    it('should hold no initial notifications', inject(function () {
      $httpBackend.flush()
      expect(scope.notifications.length).toBe(0)
    }))

    it('should receive multiple "challenge solved" notifications', inject(function () {
      socket.receive('challenge solved', { challenge: {}, hidden: false })
      socket.receive('challenge solved', { challenge: {} })
      $httpBackend.flush()
      expect(scope.notifications.length).toBe(2)
    }))

    it('should hold a message notification after receiving one', inject(function () {
      socket.receive('challenge solved', { challenge: {} })
      $httpBackend.flush()
      expect(scope.notifications[ 0 ].message).toBe('CHALLENGE_SOLVED')
    }))

    it('should translate CHALLENGE_SOLVED message', inject(function () {
      $httpBackend.expectGET(/\/i18n\/.*\.json/).respond(200, {'CHALLENGE_SOLVED': 'Translation of CHALLENGE_SOLVED'})
      socket.receive('challenge solved', { challenge: {} })
      $httpBackend.flush()
      expect(scope.notifications[ 0 ].message).toBe('Translation of CHALLENGE_SOLVED')
    }))

    it('should remove a notification on closing it', inject(function () {
      socket.receive('challenge solved', { challenge: {} })
      $httpBackend.flush()
      expect(scope.notifications.length).toBe(1)
      scope.closeNotification(0)
      expect(scope.notifications.length).toBe(0)
    }))

    it('should hold no message after receiving an empty notification', inject(function () {
      socket.receive('challenge solved', { })
      $httpBackend.flush()
      expect(scope.notifications.length).toBe(0)
    }))

    it('should hold no message after receiving an undefined notification', inject(function () {
      socket.receive('challenge solved', undefined)
      $httpBackend.flush()
      expect(scope.notifications.length).toBe(0)
    }))

    it('should hold no message after receiving another type of notification', inject(function () {
      socket.receive('definitely NOT challenge solved', {})
      $httpBackend.flush()
      expect(scope.notifications.length).toBe(0)
    }))

    it('should show no notifications when these are supposed to be hidden', inject(function () {
      scope.showNotification = jasmine.createSpy('showNotification')
      socket.receive('challenge solved', { challenge: {}, hidden: true })
      $httpBackend.flush()
      expect(scope.showNotification).not.toHaveBeenCalled()
    }))

    it('should not save progress while restore is happening', inject(function () {
      scope.saveProgress = jasmine.createSpy('saveProgress')
      socket.receive('challenge solved', { challenge: {}, isRestore: true })
      $httpBackend.flush()
      expect(scope.saveProgress).not.toHaveBeenCalled()
    }))

    it('should save progress even when notifications are hidden', inject(function () {
      scope.saveProgress = jasmine.createSpy('saveProgress')
      socket.receive('challenge solved', { challenge: {}, hidden: true, isRestore: false })
      $httpBackend.flush()
      expect(scope.saveProgress).toHaveBeenCalled()
    }))

    it('should fetch a new continue token once a challenge is completed', inject(function () {
      $httpBackend.expectGET('/rest/continue-code')
      socket.receive('challenge solved', { challenge: {} })
      $httpBackend.flush()
    }))

    it('saved the continue code into a cookie', inject(function () {
      cookies.put = jasmine.createSpy('put')
      scope.saveProgress()
      $httpBackend.flush()

      expect(cookies.put).toHaveBeenCalledWith('continueCode', 'totallyAValidCode', { expires: jasmine.any(Date) })
    }))

    it('sets showCtfCountryDetailsInNotifications to scope', inject(function () {
      $httpBackend.expectGET(/.*application-configuration/).respond(200, { 'config': { 'application': { 'showCtfFlagsInNotifications': true, showCtfCountryDetailsInNotifications: 'both' } } })
      $httpBackend.expectGET('/rest/country-mapping').respond(200, {})

      $httpBackend.flush()

      expect(scope.showCtfCountryDetailsInNotifications).toBe('both')
    }))

    it('sets countryMap to to scope', inject(function () {
      $httpBackend.expectGET(/.*application-configuration/).respond(200, { 'config': { 'application': { 'showCtfFlagsInNotifications': true, showCtfCountryDetailsInNotifications: true } } })
      $httpBackend.expectGET('/rest/country-mapping').respond(200, { 'demo-challenge': { 'name': 'France', 'code': 'FR' } })

      $httpBackend.flush()

      expect(scope.countryMap).toEqual({ 'demo-challenge': { 'name': 'France', 'code': 'FR' } })
    }))
  })
})
