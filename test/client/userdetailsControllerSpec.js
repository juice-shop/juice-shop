describe('controllers', function () {
    var scope, location, controller, window, cookieStore, $httpBackend;

    beforeEach(module('myApp'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }));

    describe('UserDetailsController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            var id;
            controller = $controller('UserDetailsController', {
                '$scope': scope,
                'id': id
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

});
