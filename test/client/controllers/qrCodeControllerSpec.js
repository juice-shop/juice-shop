describe('controllers', function () {
  var scope, data, url, address, title, controller

  beforeEach(module('juiceShop'))

  describe('QrCodeController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('QrCodeController', {
        '$scope': scope,
        'data': data,
        'url': url,
        'address': address,
        'title': title
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
    }))
  })
})
