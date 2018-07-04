describe('controllers', function () {
  var scope, location, controller, window, cookies, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
  }))

  describe('LogoutController', function () {
    beforeEach(inject(function ($rootScope, $controller, $window, $location, $cookies) {
      scope = $rootScope.$new()
      window = $window
      location = $location
      cookies = $cookies
      controller = $controller('LogoutController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
    }))

    it('should save log in IP', inject(function () {
      $httpBackend.whenGET('/rest/saveLoginIp').respond(200)
    }))

    it('should remove authentication token from cookies', inject(function () {
      expect(cookies.get('token')).toBeUndefined()
    }))

    it('should remove basket id from session storage', inject(function () {
      expect(window.sessionStorage.bid).toBeUndefined()
    }))

    it('should forward to main page', inject(function () {
      expect(location.path()).toBe('/')
    }))
  })
})
