describe('controllers', function () {
  var scope, socket, controller, cookies, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('ServerStartedNotificationController', function () {
    beforeEach(inject(function ($rootScope, $cookies, $controller, _socket_) {
      scope = $rootScope.$new()
      socket = _socket_
      cookies = $cookies
      controller = $controller('ServerStartedNotificationController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      $httpBackend.flush()

      expect(controller).toBeDefined()
      expect(scope.closeNotification).toBeDefined()
    }))

    it('should keep continue code cookie after successfully restoring progress on server start', inject(function () {
      $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(200)

      cookies.put('continueCode', 'CODE')
      socket.receive('server started')
      $httpBackend.flush()

      expect(cookies.get('continueCode')).toBe('CODE')
    }))

    it('should set auto-restore success-message when progress restore succeeds', inject(function () {
      $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(200)

      cookies.put('continueCode', 'CODE')
      socket.receive('server started')
      $httpBackend.flush()

      expect(scope.hackingProgress.autoRestoreMessage).toBe('AUTO_RESTORED_PROGRESS')
    }))

    it('should translate AUTO_RESTORED_PROGRESS message', inject(function () {
      $httpBackend.expectGET(/\/i18n\/.*\.json/).respond(200, {'AUTO_RESTORED_PROGRESS': 'Translation of AUTO_RESTORED_PROGRESS'})
      $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(200)

      cookies.put('continueCode', 'CODE')
      socket.receive('server started')
      $httpBackend.flush()

      expect(scope.hackingProgress.autoRestoreMessage).toBe('Translation of AUTO_RESTORED_PROGRESS')
    }))

    it('should log errors during automatic progress restore directly to browser console', inject(function () {
      $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(500, 'error')
      console.log = jasmine.createSpy('log')

      cookies.put('continueCode', 'CODE')
      socket.receive('server started')
      $httpBackend.flush()

      expect(console.log).toHaveBeenCalledWith('error')
    }))

    it('should set auto-restore error-message when progress restore failed', inject(function () {
      $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(500)

      cookies.put('continueCode', 'CODE')
      socket.receive('server started')
      $httpBackend.flush()

      expect(scope.hackingProgress.autoRestoreMessage).toBe('AUTO_RESTORE_PROGRESS_FAILED')
    }))

    it('should translate AUTO_RESTORE_PROGRESS_FAILED message including the returned error', inject(function () {
      $httpBackend.expectGET(/\/i18n\/.*\.json/).respond(200, {'AUTO_RESTORE_PROGRESS_FAILED': 'Translation of AUTO_RESTORE_PROGRESS_FAILED: {{error}}'})
      $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(500, 'error')

      cookies.put('continueCode', 'CODE')
      socket.receive('server started')
      $httpBackend.flush()

      expect(scope.hackingProgress.autoRestoreMessage).toBe('Translation of AUTO_RESTORE_PROGRESS_FAILED: error')
    }))

    it('do nothing if continueCode cookie is not present', inject(function () {
      cookies.remove('continueCode')
      socket.receive('server started')
      $httpBackend.flush()
    }))

    it('should remove the restore message when closing the notification', inject(function () {
      $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(200)

      socket.receive('server started')
      $httpBackend.flush()

      scope.closeNotification()

      expect(scope.hackingProgress.autoRestoreMessage).toBeNull()
    }))

    it('should remove the continue code cookie when clearing the progress', inject(function () {
      $httpBackend.whenPUT('/rest/continue-code/apply/CODE').respond(200)

      cookies.put('continueCode', 'CODE')
      socket.receive('server started')
      $httpBackend.flush()

      scope.clearProgress()

      expect(cookies.get('continueCode')).toBeUndefined()
      expect(scope.hackingProgress.cleared).toBe(true)
    }))
  })
})
