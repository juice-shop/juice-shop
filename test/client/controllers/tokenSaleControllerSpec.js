describe('controllers', function () {
  var scope, controller

  beforeEach(module('juiceShop'))

  describe('TokenSaleController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('TokenSaleController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
    }))
  })
})
