describe('controllers', function () {
    var scope, controller;

    beforeEach(module('myApp'));

    describe('NavbarController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('NavbarController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

});
