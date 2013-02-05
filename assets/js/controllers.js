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
    $scope.student_url;
    $scope.corporate_url;
    $scope.nickname;
    $scope.getLink = function(){

      $scope.Model.send({}, function(response){

        $scope.student_url = response.student_url;
        $scope.corporate_url = response.corporate_url;
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
  $scope.stud_year;

  //get student info
  $scope.getStudInfo = function(){
    $scope.Model.send({'method':"get_profile"},function(response){
      $scope.stud_info = response.u_profile;
    });
  };

  $scope.getAvailProj = function(){
    $scope.Model.send({'method':"get_available_project"}, function(response){
      $scope.avail_proj = response.proj;
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

  $scope.editorEnabled = false;
  $scope.client_proj;
  $scope.proj_backup;
  $scope.proj_key;

  $scope.getClientProj = function(){
    $scope.Model.send({'method':"get_cpr_proj"}, function(response){
      $scope.client_proj = response.proj;
      for(var i = 0; i < $scope.client_proj.length; i++){
        $scope.client_proj[i].exposure = $scope.client_proj[i].exposure.substring(1,$scope.client_proj[i].exposure.length-1);
      }
    });
  };

  $scope.createProj = function(){
    var data = {'method':"create_proj",
    'projectName':$scope.projectName,
    'projectObjective':$scope.projectObjective,
    'technologiesExposure': $scope.technologiesExposure,
    'contactPerson':$scope.contactPerson,
    'contactEmail':$scope.contactEmail,
    'contactNumber':$scope.contactNumber};

    $scope.Model.send(data, function(response){
      $scope.getClientProj();
      $('#mainAccordion').accordion();
    });
  };

  $scope.copyToForm = function(key){
    var project = angular.copy($scope.client_proj[key]);
    $scope.projectName = project.title;
    $scope.projectObjective = project.description;
    $scope.technologiesExposure = project.exposure;
    $scope.contactPerson = project.poc;
    $scope.contactEmail = project.email;
    $scope.contactNumber = project.contact;
  };

  $scope.enableEditor = function(key) {
    $scope.editorEnabled = true;
    $scope.proj_key = key;
    $scope.proj_backup = angular.copy($scope.client_proj[key]);
  };

  $scope.disableEditor = function() {
    $scope.editorEnabled = false;
    if($scope.proj_key != null){
      $scope.client_proj[$scope.proj_key] = angular.copy($scope.proj_backup);
      $scope.proj_key = null;
    }
  };

  $scope.saveProj = function(key,proj_id) {
    var project = $scope.client_proj[key];
    var data = {'method':"update_proj",
                'proj_id': proj_id,
                'ptitle': project.title,
                'pdescription': project.description,
                'pexposure': "{" + project.exposure + "}",
                'ppoc': project.poc,
                'pemail': project.email,
                'pcontact': project.contact};
    $scope.Model.send(data, function(response){
      $scope.client_proj[key] = response.proj;
      $scope.client_proj[key].exposure = $scope.client_proj[key].exposure.substring(1,$scope.client_proj[key].exposure.length-1);
      $scope.proj_key = null;
      $scope.editorEnabled = false;
      $('#' + $scope.client_proj[key].id).collapse("show");
    });
  };
  
	$scope.reset = function() {
    $scope.projectName = "";
    $scope.projectObjective = "";
    $scope.technologiesExposure ="";
    $scope.contactPerson = "";
    $scope.contactEmail = "";
    $scope.contactNumber = "";
  };

  $scope.removeProj = function(key){
    var data = {'method':"delete_proj",
                'proj_id':key};
    $scope.Model.send(data, function(response){
      if (response.result){
        $scope.getClientProj();
        $('#mainAccordion').accordion();
      }
    });
  };

  $scope.getClientProj();


}



