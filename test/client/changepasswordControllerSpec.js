describe('controllers', function () {
    var scope, location, controller, window, cookieStore, $httpBackend;

    beforeEach(module('myApp'));
        beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }));

    describe('ChangePasswordController', function () {
        beforeEach(inject(function ($rootScope, $location, $controller) {
            scope = $rootScope.$new();
            location = $location;
            controller = $controller('ChangePasswordController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.changePassword).toBeDefined();
        }));

        it('should forward to main page after changing password', inject(function ($controller) {
            $httpBackend.whenGET('/rest/user/change-password?current=old&new=foobar&repeat=foobar').respond(200);
            scope.currentPassword = 'old';
            scope.newPassword = 'foobar';
            scope.newPasswordRepeat = 'foobar';

            scope.changePassword();
            $httpBackend.flush();

            expect(location.path()).toBe('/');
        }));

        it('should gracefully handle error on password change', inject(function ($controller) {
            $httpBackend.whenGET('/rest/user/change-password?current=old&new=foobar&repeat=foobar').respond(500, 'error');
            scope.currentPassword = 'old';
            scope.newPassword = 'foobar';
            scope.newPasswordRepeat = 'foobar';

            scope.changePassword();
            $httpBackend.flush();

            expect(scope.error).toBe('error');
        }));

    });

});
