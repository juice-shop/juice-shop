describe('routes', function () {
  var $route // eslint-disable-line no-unused-vars

  beforeEach(module('juiceShop'))
  beforeEach(inject(function ($injector) {
    $route = $injector.get('$route')
  }))

  it('should redirect to /search by default',
    inject(function ($route) {
      expect($route.routes[null].redirectTo).toEqual('/search')
    }))

  it('should load Administration page for /administration route',
    inject(function ($route) {
      expect($route.routes['/administration'].controller).toBe('AdministrationController')
      expect($route.routes['/administration'].templateUrl).toEqual('views/Administration.html')
    }))

  it('should load About page for /about route',
    inject(function ($route) {
      expect($route.routes['/about'].controller).toBe('AboutController')
      expect($route.routes['/about'].templateUrl).toEqual('views/About.html')
    }))

  it('should load Contact page for /contact route',
    inject(function ($route) {
      expect($route.routes['/contact'].controller).toBe('ContactController')
      expect($route.routes['/contact'].templateUrl).toEqual('views/Contact.html')
    }))

  it('should load Login page for /login route',
    inject(function ($route) {
      expect($route.routes['/login'].controller).toBe('LoginController')
      expect($route.routes['/login'].templateUrl).toEqual('views/Login.html')
    }))

  it('should load Register page for /register route',
    inject(function ($route) {
      expect($route.routes['/register'].controller).toBe('RegisterController')
      expect($route.routes['/register'].templateUrl).toEqual('views/Register.html')
    }))

  it('should load Basket page for /basket route',
    inject(function ($route) {
      expect($route.routes['/basket'].controller).toBe('BasketController')
      expect($route.routes['/basket'].templateUrl).toEqual('views/Basket.html')
    }))

  it('should load SearchResult page for /search route',
    inject(function ($route) {
      expect($route.routes['/search'].controller).toBe('SearchResultController')
      expect($route.routes['/search'].templateUrl).toEqual('views/SearchResult.html')
    }))

  it('should load Logout page for /logout route',
    inject(function ($route) {
      expect($route.routes['/logout'].controller).toBe('LogoutController')
      expect($route.routes['/logout'].templateUrl).toEqual('views/Logout.html')
    }))

  it('should load ChangePassword page for /change-password route',
    inject(function ($route) {
      expect($route.routes['/change-password'].controller).toBe('ChangePasswordController')
      expect($route.routes['/change-password'].templateUrl).toEqual('views/ChangePassword.html')
    }))

  it('should load ScoreBoard page for /score-board route',
    inject(function ($route) {
      expect($route.routes['/score-board'].controller).toBe('ChallengeController')
      expect($route.routes['/score-board'].templateUrl).toEqual('views/ScoreBoard.html')
    }))

  it('should load Recycle page for /recycle route',
    inject(function ($route) {
      expect($route.routes['/recycle'].controller).toBe('RecycleController')
      expect($route.routes['/recycle'].templateUrl).toEqual('views/Recycle.html')
    }))
})
