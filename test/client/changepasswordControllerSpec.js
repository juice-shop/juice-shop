describe('controllers', function () {
    var scope, location, controller, window, cookieStore, $httpBackend;

    beforeEach(module('myApp'));
        beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }));

    describe('ChangePasswordController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('ChangePasswordController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.changePassword).toBeDefined();
        }));
    });

});
