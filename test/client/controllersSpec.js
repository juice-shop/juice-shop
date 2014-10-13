describe('controllers', function () {
    var scope, location, controller, window, cookieStore,
    userService = {
        login: function(params) {}
    };


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
            expect(scope.addToBasket).toBeDefined();
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
        beforeEach(inject(function ($rootScope, $window, $location, $cookieStore, $controller) {
            scope = $rootScope.$new();
            location = $location;
            window = $window;
            cookieStore = $cookieStore;
            controller = $controller('LoginController', {
                '$scope': scope,
                'UserService': userService
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
            expect(scope.login).toBeDefined();
        }));

        xit('forwards to main page after successful login', inject(function ($controller) {
            scope.user = {email : 'bender@juice-sh.op', password : 'booze'};
            spyOn(userService, 'login').andReturn("Foo");
            scope.login();
            expect(location.path()).toBe('/');
        }));

    });

    describe('LogoutController', function () {
        beforeEach(inject(function ($rootScope, $controller, $window, $location, $cookieStore) {
            scope = $rootScope.$new();
            window = $window;
            location = $location;
            cookieStore = $cookieStore;
            controller = $controller('LogoutController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));

        it('should remove authentication token from cookies', inject(function ($controller) {
            expect(cookieStore.get('token')).toBeUndefined();
        }));

        it('should remove basket id from session storage', inject(function ($controller) {
            expect(window.sessionStorage.bid).toBeUndefined();
        }));

        it('should forward to main page', inject(function ($controller) {
            expect(location.path()).toBe('/');
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

        it('forwards to search result with empty search criteria if no search query is present', inject(function ($controller) {
            scope.searchQuery = undefined;
            scope.search();
            expect(location.path()).toBe('/search');
            expect(location.search()).toEqual({q: ''});
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
            expect(scope.addToBasket).toBeDefined();
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

    describe('ChallengeController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('ChallengeController', {
                '$scope': scope
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

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

    describe('ProductDetailsController', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            var id;
            controller = $controller('ProductDetailsController', {
                '$scope': scope,
                'id': id
            });
        }));

        it('should be defined', inject(function ($controller) {
            expect(controller).toBeDefined();
        }));
    });

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
