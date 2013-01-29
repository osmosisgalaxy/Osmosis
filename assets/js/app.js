'use strict';

//var testing = window.location.search.replace("?testing=", "");
//var testing = 'true';

angular.module('myApp', ['ngResource']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/main', {templateUrl: 'app/home-page.html'}).
      when('/signup', {templateUrl: 'app/index-for-sign-up.html', controller: SignupCtrl}).
      when('/index', {templateUrl: 'app/index-for-log-in.html', controller: LoginCtrl}).
      otherwise({redirectTo: '/index'});
}]);

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
