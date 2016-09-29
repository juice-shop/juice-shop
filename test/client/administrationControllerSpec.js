describe('controllers', function () {
  var scope, controller

  beforeEach(module('juiceShop'))

  describe('AdministrationController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('AdministrationController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
    }))
  })
})
