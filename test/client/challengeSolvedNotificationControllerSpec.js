describe('controllers', function () {
  var scope, socket, controller, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.flush()
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('ChallengeSolvedNotificationController', function () {
    beforeEach(inject(function ($rootScope, $controller, _socket_) {
      scope = $rootScope.$new()
      socket = _socket_
      controller = $controller('ChallengeSolvedNotificationController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function ($controller) {
      expect(controller).toBeDefined()
      expect(scope.notifications).toBeDefined()
      expect(scope.closeNotification).toBeDefined()
    }))

    it('should hold no initial notifications', inject(function ($controller) {
      expect(scope.notifications.length).toBe(0)
    }))

    it('should receive multiple "challenge solved" notifications', inject(function ($controller) {
      socket.receive('challenge solved', { challenge: {} })
      socket.receive('challenge solved', { challenge: {} })
      expect(scope.notifications.length).toBe(2)
    }))

    it('should hold a the message notification after receiving one', inject(function ($controller) {
      socket.receive('challenge solved', { challenge: {} })
      expect(scope.notifications[ 0 ].message).toBe('CHALLENGE_SOLVED')
    }))

    it('should remove a notification on closing it', inject(function ($controller) {
      socket.receive('challenge solved', { challenge: {} })
      expect(scope.notifications.length).toBe(1)
      scope.closeNotification(0)
      expect(scope.notifications.length).toBe(0)
    }))

    it('should hold no message after receiving an empty notification', inject(function ($controller) {
      socket.receive('challenge solved', { })
      expect(scope.notifications.length).toBe(0)
    }))

    it('should hold no message after receiving an undefined notification', inject(function ($controller) {
      socket.receive('challenge solved', undefined)
      expect(scope.notifications.length).toBe(0)
    }))

    it('should hold no message after receiving another type of notification', inject(function ($controller) {
      socket.receive('definitely NOT challenge solved', {})
      expect(scope.notifications.length).toBe(0)
    }))
  })
})
