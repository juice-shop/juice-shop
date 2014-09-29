# angular-highlightjs

AngularJS directive for syntax highlighting with [highlight.js](http://highlightjs.org/).

#### Demos

* [Self-highlight plunk](http://plnkr.co/edit/OPxzDu?p=preview)
* [JSON pretty print](http://plnkr.co/edit/WCmBTQ?p=preview)

## Requirements

* Highlight.js (.js & .css)
* AngularJS v1.0.1+


## Getting started

Follow the instructions [here](http://softwaremaniacs.org/soft/highlight/en/download/) to setup highlight.js.

Using a prebuilt version of highlight.js hosted at Yandex here.
```html
<!-- personal preference: github theme -->
<link rel="stylesheet" href="http://yandex.st/highlightjs/8.0/styles/github.min.css">
<script src="http://yandex.st/highlightjs/8.0/highlight.min.js"></script>
```

Include `angular-highlightjs` module script with AngularJS script on your page.
```html
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script>
<script src="http://pc035860.github.io/angular-highlightjs/angular-highlightjs.min.js"></script>
```

Add `hljs` to your app module's dependency.
```js
angular.module('myApp', ['hljs']);
```

## Install with Bower

Note that the `angular-highlightjs` bower package contains no AngularJS dependency.

```sh
# install AngularJS (stable)
bower install angular
# or (unstable)
bower install PatternConsulting/bower-angular

# install angular-highlightjs & highlightjs
bower install angular-highlightjs
```

## Configuration

**Configuration works with highlight.js >= 8.0**

In configuration phase, call `hljsServiceProvider.setOptions()` to configure with [highlight.js options](http://highlightjs.readthedocs.org/en/latest/api.html#configure-options).

```js
myApp.config(function (hljsServiceProvider) {
  hljsServiceProvider.setOptions({
    // replace tab with 4 spaces
    tabReplace: '    '
  });
});
```

## Directive usage

### hljs
This is a required directive. Without any other supportive directives, it provides basic inline highlight function. For better understanding, some notes about using it are specified in the live example page.

[Live example](http://pc035860.github.io/angular-highlightjs/example/#/hljs)

```html
<!-- hljs start -->
<div hljs>
<!-- put your codes here -->
</div>
<!-- hljs end -->
```

#### source (optional)
Type: `expression`
Default: `undefined`

If `source` is presented, the `hljs` directive will evaluate the expression and highlight the result string. This is pretty useful for dynamically changed content.

[Live example](http://pc035860.github.io/angular-highlightjs/example/#/hljs-source)

Dynamically changed content.
```html
<!-- buttons for put/clear $scope.subSource content -->
<button class="btn btn-primary show-source" 
        ng-click="toggleSource('subSource')" ng-show="!subSource">put $scope.subSource</button>
<button class="btn btn-primary show-source" 
        ng-click="toggleSource('subSource')" ng-show="subSource">clear $scope.subSource</button>
<div ng-show="subSource">
  <br>
  <!-- hljs connected with $scope.subSource -->
  <div hljs source="subSource"></div>
</div>
```

The expression. Beware of single-quotes.
```html
<!-- hljs connected with independent string -->
<div hljs source="'<html><head><body></body></head></html>'"></div>
```

#### include (optional)
Type: `expression`
Default: `undefined`

Works as the built-in `ng-include` directive, utilizes `$templateCache` and `$http` to retrieve content from `text/ng-template` scripts or from XHR.

[Live example](http://pc035860.github.io/angular-highlightjs/example/#/hljs-include)

From `text/ng-template` script `localOne`. Beware of single-quotes in the expression.
```html
<!-- load text/ng-template named 'localOne' -->
<div hljs include="'localOne'"></div>
```

From `partials/lang-perl` XHR. Again, beware of single-quotes.
```html
<!-- load "partials/lang-perl" -->
<div hljs include="'partials/lang-perl'"></div>
```

#### language (optional)
Type: `string`
Default: `undefined`

Tells the highlight.js which language syntax should be used to highlight the codes. If not specified, highlight.js will highlight with built-in language detection.

[Live example](http://pc035860.github.io/angular-highlightjs/example/#/hljs-language)

```html
<!-- PHP codes highlight with language detection -->
<div hljs include="'partials/lang-php'"></div>

<!-- PHP codes highlight with specified language: perl -->
<div hljs include="'partials/lang-php'" language="perl"></div>
```


#### compile (optional)
Type: `expression`
Default: `undefined`

Compiles the highlighted code and links it with current scope. The expression will be evaluated after every actual highlight action.

The attribute works with all methhods of highlighting: `hljs`, `hljs source` and `hljs include`.

[Live example](http://pc035860.github.io/angular-highlightjs/example/#/hljs-compile)

```html
<div hljs include="'compile-me'" compile="true"></div>
```

### Happy highlighting!!!
