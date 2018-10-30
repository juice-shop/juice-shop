describe('controllers', function () {
  var scope, location, controller, window, cookies, $httpBackend

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    $httpBackend.whenGET(/\/i18n\/.*\.json/).respond(200, {})
    $httpBackend.whenGET(/views\/.*\.html/).respond(200, {})
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

    it('should perform the logout properly', inject(function () {
      // should save log in IP
      $httpBackend.whenGET('/rest/saveLoginIp').respond(200)
      $httpBackend.flush()

      // should remove authentication token from cookies
      expect(cookies.get('token')).toBeUndefined()

      // should remove basket id from session storage
      expect(window.sessionStorage.bid).toBeUndefined()

      // should forward to main page'
      expect(location.path()).toBe('/search')
    }))
  })
})
