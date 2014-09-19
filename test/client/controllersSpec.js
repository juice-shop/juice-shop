describe('controllers', function () {
    beforeEach(module('myApp'));

    describe('ProductController', function () {
        it('should be defined', inject(function ($controller) {
            // spec body
            var ctrl = $controller('ProductController', {
                $scope: {}
            });
            expect(ctrl).toBeDefined();
        }));
    });

    describe('UserController', function () {
        it('should be defined', inject(function ($controller) {
            // spec body
            var ctrl = $controller('UserController', {
                $scope: {}
            });
            expect(ctrl).toBeDefined();
        }));
    });

    describe('AdministrationController', function () {
        it('should be defined', inject(function ($controller) {
            // spec body
            var ctrl = $controller('AdministrationController', {
                $scope: {}
            });
            expect(ctrl).toBeDefined();
        }));
    });


});
