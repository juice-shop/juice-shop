'use strict';

describe('controllers', function () {
    beforeEach(module('myApp'));

    describe('BestDealsController', function () {
        it('should be defined', inject(function ($controller) {
            // spec body
            var ctrl = $controller('BestDealsController', {
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
