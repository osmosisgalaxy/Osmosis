'use strict';

var myApp = angular.module('myApp', ['ngResource', 'tagger', 'tagger2', 'ui.bootstrap','ui'])

.config(function ($httpProvider) {
        $httpProvider.responseInterceptors.push('myHttpInterceptor');
        var spinnerFunction = function (data, headersGetter) {
            $('#loadingscreen').show();
            return data;
        };
        $httpProvider.defaults.transformRequest.push(spinnerFunction);
    })
// register the interceptor as a service, intercepts ALL angular ajax http calls
    .factory('myHttpInterceptor', function ($q, $window) {
        return function (promise) {
            return promise.then(function (response) {
                // do something on success
                // todo hide the spinner
                $('#loadingscreen').hide();
                return response;

            }, function (response) {
                // do something on error
                // todo hide the spinner
                $('#loadingscreen').hide();
                return $q.reject(response);
            });
        };
    })
//for loading screen during ng-repeat
    .directive('myStudRepeatDirective', function(){
        return function(scope, element, attrs){
            if(scope.$last){
                $('#loadingscreen').hide();
            }else{
                $('#loadingscreen').show();
            }
        };
    });

angular.module('tagger',[]).directive('taggable', function(){
    return {
        restrict:'A',
        link: function (scope, element, attrs) {
            element.tagsManager({
                CapitalizeFirstLetter: false,
                preventSubmitOnEnter: true,
                typeahead: true,
                typeaheadAjaxSource: null,
                typeaheadSource: ["c++", "css", "jquery", "java", "javascript", "angularjs", "ios", "php", "android"],
                typeaheadPolling: true,
                delimeters: [9, 44, 188, 13, 32],
                backspace: [8],
                blinkBGColor_1: '#FFFF9C',
                blinkBGColor_2: '#CDE69C',
                hiddenTagListName: 'tech'
            });
        }
    }
});

angular.module('tagger2',[]).directive('taggable2', function(){
    return {
        restrict:'A',
        link: function (scope, element, attrs) {
            element.tagsManager({
                CapitalizeFirstLetter: false,
                preventSubmitOnEnter: true,
                typeahead: true,
                typeaheadAjaxSource: null,
                typeaheadSource: ["c++", "css", "jquery", "java", "javascript", "angularjs", "ios", "php", "android"],
                typeaheadPolling: true,
                delimeters: [9, 44, 188, 13, 32],
                backspace: [8],
                blinkBGColor_1: '#FFFF9C',
                blinkBGColor_2: '#CDE69C',
                hiddenTagListName: 'rskills'
            });
        }
    }
});



