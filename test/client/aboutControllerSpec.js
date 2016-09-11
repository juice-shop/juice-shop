describe('controllers', function () {
  var scope, controller

  beforeEach(module('juiceShop'))
  describe('AboutController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('AboutController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function ($controller) {
      expect(controller).toBeDefined()
    }))
  })
})
