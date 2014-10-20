describe('controllers', function () {
    var scope, location, controller, window, cookieStore, $httpBackend;

    beforeEach(module('myApp'));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $sce = $injector.get('$sce');
    }));

    describe('UserController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('UserController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.showDetail).toBeDefined();
        }));

        it('should hold all users', inject(function ($controller) {
            $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: [{email: 'a@a.de'},{email: 'b@b.de'}]});

            $httpBackend.flush();

            expect(scope.users.length).toBe(2);
            expect(scope.users[0].email).toBeDefined();
            expect(scope.users[1].email).toBeDefined();
        }));

        it('should not consider user email as trusted HTML', inject(function ($controller) {
            $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: [{email: 'bjoern@<script>alert("XSS3")</script>.de'}]});
            spyOn($sce, 'trustAsHtml');

            $httpBackend.flush();

            expect($sce.trustAsHtml).toHaveBeenCalled();
        }));

        it('should hold nothing when no users exist', inject(function ($controller) {
            $httpBackend.whenGET('/rest/user/authentication-details/').respond(200, {data: {}});

            $httpBackend.flush();

            expect(scope.users).toEqual({});
        }));

        it('should hold nothing on error from backend API', inject(function ($controller) {
            $httpBackend.whenGET('/rest/user/authentication-details/').respond(500);

            $httpBackend.flush();

            expect(scope.users).toBeUndefined();
        }));


    });

});
