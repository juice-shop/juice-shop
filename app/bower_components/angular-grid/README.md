# ng-grid : An Angular DataGrid

[![Build Status](https://travis-ci.org/angular-ui/ng-grid.png)](https://travis-ci.org/angular-ui/ng-grid)

_Note: We are no longer accepting feature based pull requests based on the 2.* branch. All active feature development is happening in the [master branch](https://github.com/angular-ui/ng-grid/tree/master). PRs there are encouraged and will be celebrated with virtual high fives all around.  If you are serious about helping 3.0 become a success, join the discussion at https://gitter.im/angular-ui/ng-grid_

__Contributors:__

ng-grid Team:
* [Tim Sweet](http://ornerydevelopment.blogspot.com/)
* [Jonathon Ricaurte](https://github.com/jonricaurte)
* [Brian Hann](https://github.com/c0bra)
* [Rob Larsen](https://github.com/roblarsen)
* [Shane Walters](https://github.com/swalters)

License: [MIT](http://www.opensource.org/licenses/mit-license.php)

Dependencies: jQuery & angular.js. (JqueryUi draggable for non-HTML5 compliant browsers to use awesome Drag-N-Drop aggregate feature. However, you can still groupby without draggability)

***

## About
__ng-grid__ Originally built on knockout we wanted to port it to angular.

version 2.0.13

[nuGet](https://nuget.org/packages/ng-grid)


Questions, Comments, Complaints? feel free to email us at nggridteam@gmail.com

***

## Roadmap

We are going to be adding more features here as we head to a 3.0 release, including:

* Anything else the rest of the community wants to contribute that isn't a terrible idea. :)

***
_The bare bones_:

```html
<script type="text/javascript" src="angular.js"></script>
<script type="text/javascript" src="ng-grid.js"></script>
<script>
    angular.module('myApp',['ngGrid', ... {other includes}]);
</script>
<link rel="stylesheet" type="text/css" href="../ng-grid.css" /> 
<body ng-app="myApp">
    <div ng-grid="myOptions"></div>
</body>
```
```javascript
// Define your own controller somewhere..
function MyCtrl($scope) {
	$scope.myData = [{name: "Moroni", age: 50},
                     {name: "Teancum", age: 43},
                     {name: "Jacob", age: 27},
                     {name: "Nephi", age: 29},
                     {name: "Enos", age: 34}];
	$scope.myOptions = { data: 'myData' };
	// you can also specify data as: $scope.myOptions = { data: $scope.myData }. 
	// However, updates to the underlying data will not be reflected in the grid
};

```

## Want More?
Check out the [Getting Started](https://github.com/angular-ui/ng-grid/wiki/Getting-started) and other [Docs](https://github.com/angular-ui/ng-grid/wiki)

## Examples
[Examples](http://angular-ui.github.com/ng-grid/)

## Testing

The testing setup is based on the [angular-seed project](https://github.com/angular/angular-seed/).

Make sure to set your CHROME_BIN environment variable to the full path to chrome.exe (not just its directory).

### Grunt tasks

There are a few grunt tasks for running tests:
    
    # Run unit tests
    > grunt karma:unit
    # Or use this alias:
    > grunt test

    # Run end-to-end tests (make sure to first start a web server as specified below)
    > grunt karma:e2e

    # Run midway tests
    > grunt karma:midway

### End-to-end tests

The e2e tests need a webserver to run. A simple one from the angular-seed project is included:

    > ./scripts/web-server.js

### Automated testing and building

Running this task will automatically rebuild `build/ng-grid.debug.js` when source files change, and run unit tests when `build/ng-grid.debug.js` or unit test files change. Youc an use this for testing during development.

    # Run this in its own window
    > grunt testwatch

### Integration testing

There is a task for CI testing with PhantomJS

1. Make sure the PHANTOMJS_BIN environment variable  is set properly
2. PhantomJS with the singleRun option doesn't appear to function properly in Windows. The tests will run but PhantomJS will not automatically close.
3. This task first builds the debug version of the source files and does not clean them up. If you run it you will have uncommitted changes in your working directory that you probably want to lose. `git checkout build` to lose them.

    > grunt test-ci

### Selecting browsers

All the test tasks accept a `--browsers` command line option that will be passed to karma.
    
    # Automatically re-run tests in both Chrome and FF.
    grunt testwatch --browsers=Chrome,Firefox
