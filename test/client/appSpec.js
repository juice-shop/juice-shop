describe('app', function () {
    var $httpBackend, $cookieStore, $rootScope;

    beforeEach(module('juiceShop'));
    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $cookieStore = $injector.get('$cookieStore');
        $rootScope = $injector.get('$rootScope');
    }));

    it('should be defined', inject(function (authInterceptor) {
        expect($rootScope.isLoggedIn).toBeDefined();
    }));

    it('should return token from cookie as login status for logged-in user', inject(function (authInterceptor) {
        $cookieStore.put('token', 'foobar');

        expect($rootScope.isLoggedIn()).toBe('foobar');
    }));

    it('should return undefined as login status for anonymous user', inject(function (authInterceptor) {
        $cookieStore.remove('token');

        expect($rootScope.isLoggedIn()).toBeUndefined();
    }));

    describe('authInterceptor', function () {
        it('should be defined', inject(function (authInterceptor) {
            expect(authInterceptor).toBeDefined();
        }));

        it('should do noting with request if no auth token cookie exists', inject(function (authInterceptor) {
            $cookieStore.remove('token');

            expect(authInterceptor.request({headers: {}})).toEqual({headers: {}});
        }));

        it('should add existing cookie token to request as Authorization header', inject(function (authInterceptor) {
            $cookieStore.put('token', 'foobar');

            expect(authInterceptor.request({headers: {}})).toEqual({headers: {Authorization : 'Bearer foobar'}});
            expect(authInterceptor.request({})).toEqual({headers: {Authorization : 'Bearer foobar'}});
        }));

        it('should do noting with response of any status', inject(function (authInterceptor) {
            expect(authInterceptor.response({status: 200, statusText: 'OK'})).toEqual({status: 200, statusText: 'OK'});
            expect(authInterceptor.response({status: 304, statusText: 'Not Modified'})).toEqual({status: 304, statusText: 'Not Modified'});
            expect(authInterceptor.response({status: 401, statusText: 'Unauthorized'})).toEqual({status: 401, statusText: 'Unauthorized'});
            expect(authInterceptor.response({status: 403, statusText: 'Forbidden'})).toEqual({status: 403, statusText: 'Forbidden'});
            expect(authInterceptor.response({status: 404, statusText: 'Not Found'})).toEqual({status: 404, statusText: 'Not Found'});
            expect(authInterceptor.response({status: 500, statusText: 'Internal Server Error'})).toEqual({status: 500, statusText: 'Internal Server Error'});
        }));

    });

});
