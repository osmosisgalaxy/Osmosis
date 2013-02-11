'use strict';

//var testing = window.location.search.replace("?testing=", "");
//var testing = 'true';

var myApp = angular.module('myApp', ['ngResource'])

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
    });

//All of the overrides for testing the controllers.
//This is used to simulate the backend. 
//See http://docs.angularjs.org/#dsq-login-google for details
/*if (testing=='true') {
	var myAppDev = angular.module('myApp', ['ngResource','ngMockE2E']);
	
	myAppDev.run(function($httpBackend) {

  		//var player = {name: 'Sandra'};
  		var user = {nickname: "Zen"};

  		$httpBackend.whenGET('/api/user').respond(user); 

	});
}*/
