describe('controllers', function () {
  var scope, location, controller, window, cookieStore

  beforeEach(module('juiceShop'))

  describe('LogoutController', function () {
    beforeEach(inject(function ($rootScope, $controller, $window, $location, $cookieStore) {
      scope = $rootScope.$new()
      window = $window
      location = $location
      cookieStore = $cookieStore
      controller = $controller('LogoutController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
    }))

    it('should remove authentication token from cookies', inject(function () {
      expect(cookieStore.get('token')).toBeUndefined()
    }))

    it('should remove basket id from session storage', inject(function () {
      expect(window.sessionStorage.bid).toBeUndefined()
    }))

    it('should forward to main page', inject(function () {
      expect(location.path()).toBe('/')
    }))
  })
})
