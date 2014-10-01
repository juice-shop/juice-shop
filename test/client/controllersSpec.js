describe('controllers', function () {
    var scope, location, controller, window;
    beforeEach(module('myApp'));

    describe('BestDealsController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('BestDealsController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.showDetail).toBeDefined();
        }));
    });

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
            expect(scope.delete).toBeDefined();
        }));
    });

    describe('AdministrationController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('AdministrationController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

    describe('AboutController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('AboutController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

    describe('FeedbackController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('FeedbackController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.delete).toBeDefined();
        }));
    });

    describe('ContactController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('ContactController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.save).toBeDefined();
        }));
    });

    describe('LoginController', function () {
        beforeEach(inject(function ($rootScope, $window, $location, $controller) {
            scope = $rootScope.$new();
            location = $location;
            window = $window;
            controller = $controller('LoginController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.login).toBeDefined();
        }));
    });

    describe('LogoutController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('LogoutController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

    describe('RegisterController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('RegisterController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.save).toBeDefined();
        }));
    });

    describe('SearchController', function () {
        beforeEach(inject(function ($rootScope, $location, $controller) {
            scope = $rootScope.$new();
            location = $location;
            controller = $controller('SearchController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.search).toBeDefined();
        }));

        it('forwards to search result with search query as URL parameter', inject(function ($controller) {
            scope.searchQuery = 'lemon juice';
            scope.search();
            expect(location.path()).toBe('/search');
            expect(location.search()).toEqual({q: 'lemon juice'});
        }));

    });

    describe('SearchResultController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('SearchResultController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.showDetail).toBeDefined();
        }));
    });

    describe('NavbarController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('NavbarController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.isLoggedIn).toBeDefined();
        }));
    });

    describe('BasketController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('BasketController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.delete).toBeDefined();
            expect(scope.inc).toBeDefined();
            expect(scope.dec).toBeDefined();
        }));
    });

});
