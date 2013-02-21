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
  $scope.Model = $resource("http://osmosisgal.appspot.com/link",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );
    $scope.student_url = "#";
    $scope.corporate_url = "#";
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
  $scope.Model = $resource("http://osmosisgal.appspot.com/:method",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );
  $scope.editorEnabled = false;
  $scope.team_info_backup;
  $scope.gotTeam = false;
  $scope.avail_proj;
  $scope.stud_info;
  $scope.stud_team;
  $scope.team_recruit;
  $scope.stud_finding;
  $scope.stud_year;
  $scope.isLeader = false;
  $scope.isLogin = false;
  $scope.home_link = "student-page.html";

  $scope.checkLogin = function(){
    $scope.Model.send({'method':"check_login"},function(response){
      if (response.result == "true" && response.user_type == "std"){
        $scope.isLogin = true;
        $scope.stud_info = response.user_profile;
        $scope.getAvailProj();
        $scope.getStudTeam();
        $scope.getStudFinding();
        $scope.getTeamRecruit();
      }
      else{
        window.location = "http://osmosisgalaxy.github.com/Osmosis/login.html";
      }
    });
  };

  $scope.getAvailProj = function(){
    $scope.Model.send({'method':"get_available_project"}, function(response){
      $scope.avail_proj = response.proj;
    });
  };

  $scope.getStudTeam = function(){
    $scope.Model.send({'method':"get_user_team"}, function(response){
      $scope.stud_team = response;
      if(response.teamid != null){
        $scope.gotTeam = true;
      }
      if(response.isLeader == "true"){
        $scope.isLeader = true;
      }
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

  $scope.createTeam = function(){
    var data = {'method':"createTeam",
      't_name': $scope.teamName};

    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.gotTeam = true;
      $scope.getStudFinding();
      $scope.teamName = "";
      $scope.isLeader = true;
      $scope.getTeamRecruit();
    });
  };

  $scope.deleteTeam = function(){
    var data = {'method':"delete_team",
      'team_id': $scope.stud_team["teamid"]};

    $scope.Model.send(data, function(response){
      $scope.gotTeam = false;
      $scope.stud_team = response;
      if(response.teamid != null){
        $scope.gotTeam = true;
      }
      $scope.getStudFinding();
      $scope.getTeamRecruit();
    });
  };

  $scope.expelMember = function(stud_id){
    var data = {'method':"expel_member",
      'team_id': $scope.stud_team["teamid"],
      'stud_id': stud_id};

    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.getStudFinding();
    });
  };

  $scope.leaveTeam = function(){
    var data = {'method':"leave_team"};

    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.getTeamRecruit();
      $scope.gotTeam = false;
    });
  };

  $scope.enableEditor = function() {
    $scope.editorEnabled = true;
    $scope.team_info_backup = angular.copy($scope.stud_team);

  };

  $scope.disableEditor = function() {
    $scope.editorEnabled = false;
    $scope.stud_team = angular.copy($scope.team_info_backup);
  };

  $scope.saveTeamInfo = function() {
    var data = {'method':"update_team",
                'teamid': $scope.stud_team.teamid,
                'name': $scope.stud_team.name,
                'aoi': "{" + $scope.stud_team.aoi + "}",
                'fyp': $scope.stud_team.fyp,
                'searching': $scope.stud_team.searching,
                'wiki':$scope.stud_team.wiki,
                'position':$scope.stud_team.position
                };
    $scope.Model.send(data, function(response){
      $scope.editorEnabled = false;
    });
  };

  $scope.inviteStudent = function(stud_id){
    var id = "s_" + stud_id + "_inviteMessage"
    var message = document.getElementById(id).value
    var data = {'method':"invite_student",
                'teamid': $scope.stud_team.teamid,
                'studentid': stud_id,
                'message': message
                };
    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.getStudTeam();
      $scope.getStudFinding();
    });
  };

  $scope.cancelInvitation = function(stud_id){
    var id = "p_" + stud_id + "_cancelInvitation"
    var message = document.getElementById(id).value
    var data = {'method':"cancel_invitation",
                'teamid': $scope.stud_team.teamid,
                'studentid': stud_id,
                'message': message
                };
    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.getStudTeam();
      $scope.getStudFinding();
      $scope.getTeamRecruit();
    });
  };

  $scope.rejectRequest = function(stud_id){
    var id = "p_" + stud_id + "_rejectRequest"
    var message = document.getElementById(id).value
    var data = {'method':"reject_request",
                'teamid': $scope.stud_team.teamid,
                'studentid': stud_id,
                'message': message
                };
    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.getStudTeam();
      $scope.getStudFinding();
      $scope.getTeamRecruit();
    });
  };

  $scope.acceptRequest = function(stud_id){
    var data = {'method':"accept_request",
                'teamid': $scope.stud_team.teamid,
                'studentid': stud_id
                };
    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.getStudTeam();
      $scope.getStudFinding();
      $scope.getTeamRecruit();
    });
  };

  $scope.requestJoinTeam = function(team_id){
    var id = "t_" + team_id + "_requestMessage"
    var message = document.getElementById(id).value
    var data = {'method':"request_join_team",
                'teamid': team_id,
                'message': message
                };
    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.getStudTeam();
      $scope.getTeamRecruit();
      $scope.getStudFinding();
    });
  };

  $scope.cancelRequest = function(team_id){
    var id = "srm_" + team_id + "_cancelMessage"
    var message = document.getElementById(id).value
    var data = {'method':"cancel_request",
                'teamid': team_id,
                'message': message
                };
    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.getStudTeam();
      $scope.getTeamRecruit();
      $scope.getStudFinding();
    });
  };

  $scope.rejectInvitation = function(team_id){
    var id = "sim_" + team_id + "_rejectMessage"
    var message = document.getElementById(id).value
    var data = {'method':"reject_invitation",
                'teamid': team_id,
                'message': message
                };
    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.getStudTeam();
      $scope.getTeamRecruit();
    });
  };

  $scope.acceptInvitation = function(team_id){
    var data = {'method':"accept_invitation",
                'teamid': team_id
                };
    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      if(response.teamid != null){
        $scope.gotTeam = true;
      }
      if(response.isLeader == "true"){
        $scope.isLeader = true;
      }
      $scope.getStudTeam();
      $scope.getTeamRecruit();
    });
  };

  $scope.checkLogin();
}

function ClientCtrl($scope,$resource){
  $scope.Model = $resource("http://osmosisgal.appspot.com/:method",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );

  $scope.editorEnabled = false;
  $scope.client_proj;
  $scope.proj_backup;
  $scope.proj_key;
  $scope.display_name = "Anonymous";
  $scope.home_link = "student-page.html";

  $scope.isLogin = false;

  $scope.sample_proj = {
    'name': "My Sample Project: Building an Interactive Webpage",
    'description': "This project requires student to work on building a interactive webpage where users no longer need to think and understand how to use the webpage, but rather the elements of the webpage will guide the user along such as tutorials and basic validation of forms.",
    'exposure': "Javascript,CSS,Java,JQuery,AJAX,Angularjs",
    'company': "Sample Co.",
    'poc': "Sam Pearl",
    'email': "sam.pearl@sample.com",
    'number': "72673275"
  };

  $scope.checkLogin = function(){
    $scope.Model.send({'method':"check_login"},function(response){
      if (response.result == "true" && response.user_type == "cpr"){
        $scope.isLogin = true;
        if (response.user_profile.full_name != null){
          $scope.display_name = response.user_profile.full_name;
        }
        $scope.getClientProj();
      }
      else{
        window.location = "http://osmosisgalaxy.github.com/Osmosis/login.html";
      }
    });
  };

  $scope.getClientProj = function(){
    $scope.Model.send({'method':"get_cpr_proj"}, function(response){
      var projects = response.proj;
      for(var i = 0; i < projects.length; i++){
        projects[i].exposure = projects[i].exposure.substring(1,projects[i].exposure.length-1);
      }
      $scope.client_proj = projects;
    });
  };

  $scope.createProj = function(){
    var data = {'method':"create_proj",
    'title':$scope.projectName,
    'description':$scope.projectObjective,
    'exposure': "{" + $scope.technologiesExposure + "}",
    'poc':$scope.contactPerson,
    'email':$scope.contactEmail,
    'company':$scope.company,
    'contact':$scope.contactNumber};

    $scope.Model.send(data, function(response){
      $scope.client_proj.push(data);
      $('#mainAccordion').load();
      return false;
    });
  };

  $scope.copyToForm = function(key){
    var project = angular.copy($scope.client_proj[key]);
    $scope.projectName = project.title;
    $scope.projectObjective = project.description;
    $scope.technologiesExposure = project.exposure;
    $scope.companyName = project.company;
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
                'pexposure': project.exposure,
                'pcompany': project.company,
                'ppoc': project.poc,
                'pemail': project.email,
                'pcontact': project.contact};
    $scope.Model.send(data, function(response){
      $scope.proj_key = null;
      $scope.editorEnabled = false;
    });
  };
  
	$scope.reset = function() {
    $scope.projectName = "";
    $scope.projectObjective = "";
    $scope.technologiesExposure ="";
    $scope.companyName = "";
    $scope.contactPerson = "";
    $scope.contactEmail = "";
    $scope.contactNumber = "";
  };

  $scope.removeProj = function(proj_id, key){
    var data = {'method':"delete_proj",
                'proj_id':proj_id};
    $scope.Model.send(data, function(response){
      if (response.result){
        $scope.client_proj.splice(key,1);
        $('#mainAccordion').load();
      }
    });
  };

  $scope.genSampleProj = function(){

    $scope.projectName = $scope.sample_proj.name;
        $scope.projectObjective = $scope.sample_proj.description;
        $scope.technologiesExposure = $scope.sample_proj.exposure;
        $scope.companyName = $scope.sample_proj.company;
        $scope.contactPerson = $scope.sample_proj.poc;
        $scope.contactEmail = $scope.sample_proj.email;
        $scope.contactNumber = $scope.sample_proj.number;

  };

  $scope.checkLogin();
}

function ProjectCtrl($scope,$resource){
  $scope.Model = $resource("http://osmosisgal.appspot.com/:method",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );

  $scope.home_link;
  $scope.isLogin = false;

  $scope.checkLogin = function(){
    $scope.Model.send({'method':"check_login"},function(response){
      if (response.result == "true"){
        $scope.isLogin = true;
        if(response.user_type == "cpr"){
          if (response.user_profile.full_name != null){
            $scope.display_name = response.user_profile.full_name;
          }
        }
        else{
          $scope.display_name = response.user_profile.email;
        }
      }
      else{
        window.location = "http://osmosisgalaxy.github.com/Osmosis/login.html";
      }
    });
  };
}



