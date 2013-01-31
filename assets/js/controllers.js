'use strict';
/*SharedServices for the use of:
-Get URL link to redirect user back to login page if user is not in db or user is not logged in
-Get user data (general data)
-Get user profile (Student or Corporate)
Information will be shared across all controllers except LoginCtrl, which is at the login page

myApp.factory('mySharedServices', function($rootScope,$resource){

  var sharedService = {};

  sharedService.url_link;
  sharedService.user;
  sharedService.user_profile;

  sharedService.getUserInfo = function($resource){
    this.Model = $resource("http://galaxy-osmosis.appspot.com/db/getUserInfo",
      {},
      {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
      );
    this.Model.send({}, function(response){

      this.url_link = response.url_link;
      this.user = response.user;
      this.user_profile = response.user_profile;
    });

    this.broadcastUserInfo();
  };

  sharedService.broadcastUserInfo = function(){

    $rootScope.$broadcast('receiveUserInfo');
  }

  return sharedService;

});
////////////////////////
  //Start of sharedService
  $scope.url_link;
  $scope.user;
  $scope.user_profile;

  //check if other controllers have already executed sharedService
  if($scope.user == null){

    sharedService.getUserInfo();
    if($scope.user == null){

      window.location = "http://pohyz.github.com/Osmosis_Ver_2/login_acc.html";
    }

  }
  else{

    $scope.user_name = user_profile.full_name;
  }

  $scope.$on('receiveUserInfo',function(){
    $scope.url_link = sharedService.url_link;
    $scope.user = sharedService.user;
    $scope.user_profile = sharedService.user_profile;
  });
  //End of sharedService
  ////////////////////////
/* Controllers */

function LoginCtrl($scope,$resource){
  $scope.Model = $resource("http://osmosisgalaxy.appspot.com/link",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );
    $scope.login_url;
    $scope.nickname;
    $scope.getLink = function(){

      $scope.Model.send({}, function(response){

        $scope.login_url = response.student_url;
        $scope.nickname = response.nickname;
      });
    };

    $scope.getLink();
}

function StudentCtrl($scope,$resource){
  $scope.Model = $resource("http://osmosisgalaxy.appspot.com/:method",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );

  $scope.avail_proj;
  $scope.stud_info;
  $scope.stud_team;
  $scope.team_recruit;
  $scope.stud_finding;

  //get student info
  $scope.getStudInfo = function(){
    $scope.Model.send({'method':"get_profile"},function(response){
      $scope.stud_info = response.u_profile;
    });
  };

  $scope.getAvailProj = function(){
    $scope.Model.send({'method':"get_available_project"}, function(response){
      $scope.avail_proj = response.projects;
    });
  };

  $scope.getStudTeam = function(){
    $scope.Model.send({'method':"get_user_team"}, function(response){
      $scope.stud_team = response.team;
    });
  };

  $scope.getTeamRecruit = function(){
    $scope.Model.send({'method':"get_team_recruiting"}, function(response){
      $scope.team_recruit = response.teams;
    });
  };

  $scope.getStudFinding = function(){
    $scope.Model.send({'method':"get_available_stud"}, function(response){
      $scope.stud_finding = response.students;
    });
  };

  $scope.getStudInfo();
  $scope.getAvailProj();
  $scope.getStudTeam();
  $scope.getStudFinding();
  $scope.getTeamRecruit();
}

function ClientCtrl($scope,$resource){
  $scope.Model = $resource("http://osmosisgalaxy.appspot.com/:method",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );

  $scope.client_proj;

  $scope.getClientProj = function(){
    $scope.Model.send({'method':"get_cpr_proj"}, function(response){
      $scope.client_proj = response.proj;
    });
  };

  $scope.createProj = function(){
    var data = {'method':"create_proj",
    'projectName':$scope.projectName,
    'projectObjective':$scope.projectObjective,
    'technologiesExposure':$scope.technologiesExposure,
    'contactPerson':$scope.contactPerson,
    'contactEmail':$scope.contactEmail};

    $scope.Model.send(data, function(response){
      getClientProj();
    });
  }
}
