describe('controllers', function () {
  var scope, location, controller, window, cookieStore

  beforeEach(module('juiceShop'))

  describe('OAuthController', function () {
    beforeEach(inject(function ($rootScope, $controller, $window, $location, $cookieStore) {
      scope = $rootScope.$new()
      window = $window
      location = $location
      cookieStore = $cookieStore
      controller = $controller('OAuthController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
    }))

    xit('should forward to main page after successful login', inject(function () {
      expect(location.path()).toBe('/')
    }))

    xit('should remove authentication token from cookies after failed login', inject(function () {
      expect(cookieStore.get('token')).toBeUndefined()
    }))

    xit('should remove basket id from session storage after failed login', inject(function () {
      expect(window.sessionStorage.bid).toBeUndefined()
    }))

    xit('should forward to login page after failed login', inject(function () {
      expect(location.path()).toBe('/login')
    }))

    xit('should remove authentication token from cookies after failing to retrieve OAuth access token', inject(function () {
      expect(cookieStore.get('token')).toBeUndefined()
    }))

    xit('should remove basket id from session storage after failing to retrieve OAuth access token', inject(function () {
      expect(window.sessionStorage.bid).toBeUndefined()
    }))

    xit('should forward to login page after failing to retrieve OAuth access token', inject(function () {
      expect(location.path()).toBe('/login')
    }))
  })
})
