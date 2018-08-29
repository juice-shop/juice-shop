describe('controller', function () {
  var scope, controller, window

  beforeEach(module('juiceShop'))

  describe('LoginController', function () {
    beforeEach(inject(function ($rootScope, $window, $controller) {
      scope = $rootScope.$new()
      window = { location: { replace: jasmine.createSpy() } }
      controller = $controller('LoginController', {
        '$scope': scope,
        '$window': window
      })
    }))

    it('forwards to Google API when performing OAuth login', inject(function () {
      expect(controller).toBeDefined()

      scope.googleLogin()

      expect(window.location.replace).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/v2/auth?client_id=1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com&response_type=token&scope=email&redirect_uri=undefined')
    }))
  })
})
