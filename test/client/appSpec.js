describe('app', function () {
  var $cookies, $rootScope, $httpProvider

  beforeEach(module('juiceShop', function (_$httpProvider_) {
    $httpProvider = _$httpProvider_
  }))
  beforeEach(inject(function ($injector) {
    $cookies = $injector.get('$cookies')
    $rootScope = $injector.get('$rootScope')
  }))

  it('should be defined', inject(function () {
    expect($rootScope.isLoggedIn).toBeDefined()
  }))

  it('should return token from cookie as login status for logged-in user', inject(function () {
    $cookies.put('token', 'foobar')

    expect($rootScope.isLoggedIn()).toBe('foobar')

    $cookies.remove('token')
  }))

  it('should return undefined as login status for anonymous user', inject(function () {
    $cookies.remove('token')

    expect($rootScope.isLoggedIn()).toBeUndefined()
  }))

  describe('authInterceptor', function () {
    it('should be defined', inject(function (authInterceptor) {
      expect(authInterceptor).toBeDefined()
    }))

    it('should do nothing with request if no auth token cookie exists', inject(function (authInterceptor) {
      $cookies.remove('token')

      expect(authInterceptor.request({ headers: {} })).toEqual({ headers: {} })
      expect(authInterceptor.request({})).toEqual({ headers: {} })
    }))

    it('should add existing cookie token to request as Authorization header', inject(function (authInterceptor) {
      $cookies.put('token', 'foobar')

      expect(authInterceptor.request({ headers: {} })).toEqual({ headers: { Authorization: 'Bearer foobar' } })
      expect(authInterceptor.request({})).toEqual({ headers: { Authorization: 'Bearer foobar' } })

      $cookies.remove('token')
    }))

    it('should do noting with response of any status', inject(function (authInterceptor) {
      expect(authInterceptor.response({ status: 200, statusText: 'OK' })).toEqual({ status: 200, statusText: 'OK' })
      expect(authInterceptor.response({ status: 304, statusText: 'Not Modified' })).toEqual({ status: 304, statusText: 'Not Modified' })
      expect(authInterceptor.response({ status: 401, statusText: 'Unauthorized' })).toEqual({ status: 401, statusText: 'Unauthorized' })
      expect(authInterceptor.response({ status: 403, statusText: 'Forbidden' })).toEqual({ status: 403, statusText: 'Forbidden' })
      expect(authInterceptor.response({ status: 404, statusText: 'Not Found' })).toEqual({ status: 404, statusText: 'Not Found' })
      expect(authInterceptor.response({ status: 500, statusText: 'Internal Server Error' })).toEqual({ status: 500, statusText: 'Internal Server Error' })
    }))

    it('should be configured as HTTP interceptor', inject(function () {
      expect($httpProvider.interceptors).toContain('authInterceptor')
    }))
  })

  describe('rememberMeInterceptor', function () {
    it('should be defined', inject(function (rememberMeInterceptor) {
      expect(rememberMeInterceptor).toBeDefined()
    }))

    it('should do noting with request if no email cookie exists', inject(function (rememberMeInterceptor) {
      $cookies.remove('email')

      expect(rememberMeInterceptor.request({ headers: {} })).toEqual({ headers: {} })
      expect(rememberMeInterceptor.request({})).toEqual({ headers: {} })
    }))

    it('should do noting with request if email cookie is empty', inject(function (rememberMeInterceptor) {
      $cookies.put('email', '')

      expect(rememberMeInterceptor.request({ headers: {} })).toEqual({ headers: {} })
      expect(rememberMeInterceptor.request({})).toEqual({ headers: {} })

      $cookies.remove('email')
    }))

    it('should add existing cookie email to request as X-User-Email header', inject(function (rememberMeInterceptor) {
      $cookies.put('email', 'foo@b.ar')

      expect(rememberMeInterceptor.request({ headers: {} })).toEqual({ headers: { 'X-User-Email': 'foo@b.ar' } })
      expect(rememberMeInterceptor.request({})).toEqual({ headers: { 'X-User-Email': 'foo@b.ar' } })

      $cookies.remove('email')
    }))

    it('should do noting with response of any status', inject(function (rememberMeInterceptor) {
      expect(rememberMeInterceptor.response({ status: 200, statusText: 'OK' })).toEqual({ status: 200, statusText: 'OK' })
      expect(rememberMeInterceptor.response({ status: 304, statusText: 'Not Modified' })).toEqual({ status: 304, statusText: 'Not Modified' })
      expect(rememberMeInterceptor.response({ status: 401, statusText: 'Unauthorized' })).toEqual({ status: 401, statusText: 'Unauthorized' })
      expect(rememberMeInterceptor.response({ status: 403, statusText: 'Forbidden' })).toEqual({ status: 403, statusText: 'Forbidden' })
      expect(rememberMeInterceptor.response({ status: 404, statusText: 'Not Found' })).toEqual({ status: 404, statusText: 'Not Found' })
      expect(rememberMeInterceptor.response({ status: 500, statusText: 'Internal Server Error' })).toEqual({ status: 500, statusText: 'Internal Server Error' })
    }))

    it('should be configured as HTTP interceptor', inject(function () {
      expect($httpProvider.interceptors).toContain('rememberMeInterceptor')
    }))
  })

  describe('emailName filer', function () {
    var emailName

    beforeEach(function () {
      inject(function ($injector) {
        emailName = $injector.get('$filter')('emailName')
      })
    })

    it('should be defined', inject(function () {
      expect(emailName).toBeDefined()
    }))

    it('should return name from an email', inject(function () {
      expect(emailName('admin@juice-sh.op')).toBe('admin')
    }))

    it('should return first and last name from a typical email', inject(function () {
      expect(emailName('bjoern.kimminich@owasp.org')).toBe('bjoern kimminich')
    }))
  })
})
