describe('controllers', function () {
  var scope, controller, $translate

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $translate = $injector.get('$translate')
  }))

  describe('LanguageController', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new()
      controller = $controller('LanguageController', {
        '$scope': scope
      })
    }))

    it('should be defined', inject(function () {
      expect(controller).toBeDefined()
    }))

    it('should set selected a language', inject(function () {
      spyOn($translate, 'use')

      scope.changeLanguage('xx')

      expect($translate.use).toHaveBeenCalledWith('xx')
    }))
  })
})
