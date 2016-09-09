describe('controllers', function () {
    var scope, controller, $httpBackend;

    beforeEach(module('juiceShop'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }));

    describe('ComplaintController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('ComplaintController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.save).toBeDefined();
        }));

        it('should miss complaint object if retrieving currently logged in user fails', inject(function ($controller) {
            $httpBackend.whenGET('/rest/user/whoami').respond(500);

            $httpBackend.flush();

            expect(scope.complaint).toBeUndefined();

        }));

        it('should hold the user email of the currently logged in user', inject(function ($controller) {
            $httpBackend.whenGET('/rest/user/whoami').respond(200, {email: 'x@x.xx'});

            $httpBackend.flush();

            expect(scope.userEmail).toBe('x@x.xx');

        }));

        it('should hold no email if current user is not logged in', inject(function ($controller) {
            $httpBackend.whenGET('/rest/user/whoami').respond(200, {});

            $httpBackend.flush();

            expect(scope.userEmail).toBeUndefined();

        }));


        it('should display support message with #id and reset feedback form on saving complaint', inject(function ($controller) {
            $httpBackend.whenGET('/rest/user/whoami').respond(200, {});

            $httpBackend.whenPOST('/api/Complaints/').respond(200, {data: {id: '42', message: 'Test'}});
            scope.complaint = {id: '42', message: 'Test'}
            scope.form = {$setPristine: function() {}};

            scope.save();
            $httpBackend.flush();

            expect(scope.complaint).toEqual({});
            expect(scope.confirmation).toBe('Customer support will get in touch with you soon! Your complaint reference is #42');

        }));


    });

});
