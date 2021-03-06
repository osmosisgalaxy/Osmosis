'use strict';

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

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
//Student Ctrl
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
function StudentCtrl($scope,$resource,$timeout){
  $scope.Model = $resource("http://osmosisgal.appspot.com/:method",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );
  $scope.editorEnabled = false;
  $scope.p_editorEnabled = false;
  $scope.stud_profile_backup;
  $scope.team_info_backup;
  $scope.gotTeam = false;
  $scope.avail_proj;
  $scope.stud_info;
  $scope.stud_info_backup;
  $scope.stud_team;
  $scope.team_recruit;
  $scope.stud_finding;
  $scope.stud_year;
  $scope.isLeader = false;
  $scope.isLogin = false;
  $scope.home_link = "student-page.html";
  $scope.stud_finding_pag = {};
  $scope.currentpage = 0;
  $scope.page_chosen = null;
  $scope.pagelength = 0;
  $scope.team_got_member = false;
  $scope.user_profile;
  $scope.user_profile_backup;
  $scope.isClient = false;

  $scope.checkLogin = function(){
    $scope.Model.send({'method':"check_login"},function(response){
      var link_info = location.pathname.split("/");
      if(link_info[link_info.length - 1] == 'team-page.html'){
        if(response.result == "true" && response.user_type == "cpr"){
          $scope.user_profile = response.user_profile;
          $scope.isLogin = true;
          $scope.isClient = true;
          $scope.home_link = "client-page.html"
          if (response.user_profile.full_name != null){
            $scope.display_name = response.user_profile.full_name;
          }
        }
        else if(response.result == "true" && response.user_type == "std"){
          $scope.isLogin = true;
          $scope.isClient = false;
          $scope.home_link = "student-page.html"
          $scope.stud_info = response.user_profile;
          $scope.display_name = response.user_profile.email;
        }
        $scope.getTeamRecruit();
      }
      else if (response.result == "true" && response.user_type == "std"){
        $scope.isLogin = true;
        $scope.isClient = false;
        $scope.home_link = "student-page.html"
        $scope.stud_info = response.user_profile;
        $scope.display_name = response.user_profile.email;
        $scope.getAvailProj();
        $scope.getStudTeam();
        $scope.getStudFinding();
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
        if($scope.stud_team.member != null){
          $scope.team_got_member = true;
        }
        else{
          $scope.team_got_member = false;
        }
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
      $('#loadingscreen').show();
      $scope.stud_pagination();
    });
  };

  //Turn stud findings into arrays"pages" of 10
  $scope.stud_pagination = function(){
    //for each year
    for(var i in $scope.stud_finding){
      //get all students out from the particular year
      var students = $scope.stud_finding[i]["students"];
      //used to group students in 10 and put into year_grp
      var grp_of_ten = [];
      //so called the "pages" of that year of students with each
      //page maximum of 10 students
      var year_grp = [];

      //for each student in the year
      for(var j in students){
        //push the first student, because using modulus,
        //anything 0 modulus will be 0
        if(j == 0){
          grp_of_ten.push(students[j]);
          if(j == students.length - 1){
            year_grp.push(grp_of_ten);
            grp_of_ten = [];
          }
        }
        //keep pushing into grp_of_ten
        else if((j % 10) != 0){
          if(j != students.length - 1){
            grp_of_ten.push(students[j]);
          }
          //if students are less than 10,
          //straight away push into year_grp,
          //and move on to next year
          else{
            grp_of_ten.push(students[j]);
            year_grp.push(grp_of_ten);
            grp_of_ten = [];
          }
        }
        //grp_of_ten reach maximum of 10,
        //move on to the "next page"
        else{
          year_grp.push(grp_of_ten);
          grp_of_ten = [];
          grp_of_ten.push(students[j]);
        }
      }
      //using year as the hashkey, put the year_grp as value
      $scope.stud_finding_pag[$scope.stud_finding[i]["year"]] = year_grp;
      year_grp = [];
    }
  };

  $scope.reset_page = function(key){
    $('[rel=popover]').popover('hide');
    $scope.currentpage = 0;
    $('.pp_btn').addClass('disabled');
    $('.pn_btn').removeClass('disabled');
    if($scope.stud_finding_pag[key].length <= 1){
      $('.pn_btn').addClass('disabled');
    }
    if($scope.stud_finding_pag[key].length == 0){
      $scope.currentpage = -1;
    }
    $scope.pagelength = $scope.stud_finding_pag[key].length;
    $scope.page_chosen = $scope.stud_finding_pag[key][$scope.currentpage];
  };

  $scope.next_page = function(key){
    if($scope.currentpage < $scope.stud_finding_pag[key].length - 1){
      $('.pp_btn').removeClass('disabled');
      $scope.currentpage = $scope.currentpage + 1;
      $scope.page_chosen = $scope.stud_finding_pag[key][$scope.currentpage];
    }
    if($scope.currentpage == $scope.stud_finding_pag[key].length - 1){
      $('.pn_btn').addClass('disabled');
    }

  };

  $scope.previous_page = function(key){
    if($scope.currentpage > 0){
      $('.pn_btn').removeClass('disabled');
      $scope.currentpage = $scope.currentpage - 1;
      $scope.page_chosen = $scope.stud_finding_pag[key][$scope.currentpage];
    }
    if($scope.currentpage == 0){
      $('.pp_btn').addClass('disabled');
    }
  };

  $scope.searchStudentFunction = function(val){
    //return !!((val.exposure.indexOf($scope.nameFilter || '') !== -1));
    var namef = "";
    var emailf = "";
    var skillf = "";
    var aoif = "";
    var fypf = "";
    if($scope.nameFilter != null){namef = $scope.nameFilter.toLowerCase();}
    if($scope.emailFilter != null){emailf = $scope.emailFilter.toLowerCase();}
    if($scope.skillFilter != null){skillf = $scope.skillFilter.toLowerCase();}
    if($scope.aoiFilter != null){aoif = $scope.aoiFilter.toLowerCase();}
    if($scope.fypFilter != null){fypf = $scope.fypFilter.toLowerCase();}

    var vname = "";
    var vemail = "";
    var vskill = "";
    var vaoi = "";
    var vfyp = "";
    if(val.full_name != null){vname = val.full_name.toLowerCase();}
    if(val.email != null){vemail = val.email.toLowerCase();}
    if(val.skill != null){vskill = val.skill.toLowerCase();}
    if(val.aoi != null){vaoi = val.aoi.toLowerCase();}
    if(val.fyp != null){vfyp = val.fyp.toLowerCase();}

    if((vname.indexOf(namef || '') !== -1)&&
      (vemail.indexOf(emailf || '') !== -1)&&
      (vskill.indexOf(skillf || '') !== -1)&&
      (vaoi.indexOf(aoif || '') !== -1)&&
      (vfyp.indexOf(fypf || '') !== -1)//&&
      //(val.email.indexOf($scope.emailFilter || '') != -1)//&&
      //(val.contact.toLowerCase().indexOf($scope.conNumFilter.toLowerCase() || '') !== -1)
      ){
      return true;
    }
    return false;
  };

  $scope.searchTeamFunction = function(val){
    //return !!((val.exposure.indexOf($scope.nameFilter || '') !== -1));
    var tnamef = "";
    var memf = "";
    var taoif = "";
    var tfypf = "";
    var opf = "";
    if($scope.tnameFilter != null){tnamef = $scope.tnameFilter.toLowerCase();}
    if($scope.memFilter != null){memf = $scope.memFilter;}
    if($scope.taoiFilter != null){taoif = $scope.taoiFilter.toLowerCase();}
    if($scope.tfypFilter != null){tfypf = $scope.tfypFilter.toLowerCase();}
    if($scope.opFilter != null){opf = $scope.opFilter.toLowerCase();}

    var vtname = "";
    var vmem = [];
    var vtaoi = "";
    var vtfyp = "";
    var vop = "";
    if(val.name != null){vtname = val.name.toLowerCase();}
    //change into array -> then a string
    if(val.member.length != 0){
      for(var i = 0; i < val.member.length; i++){
        vmem.push(val.member[i].full_name);
      }
      vmem = vmem.join();
    }
    else{
      vmem = "";
    }
    if(val.aoi != null){vtaoi = val.aoi.toLowerCase();}
    if(val.fyp != null){vtfyp = val.fyp.toLowerCase();}
    if(val.position != null){vop = val.position.toLowerCase();}

    if((vtname.indexOf(tnamef || '') !== -1)&&
      (vmem.indexOf(memf || '') !== -1)&&
      (vtaoi.indexOf(taoif || '') !== -1)&&
      (vtfyp.indexOf(tfypf || '') !== -1)&&
      (vop.indexOf(opf || '') !== -1)//&&
      //(val.email.indexOf($scope.emailFilter || '') != -1)//&&
      //(val.contact.toLowerCase().indexOf($scope.conNumFilter.toLowerCase() || '') !== -1)
      ){
      return true;
    }
    return false;
  };

  $scope.profile_enableEditor = function() {
    $scope.p_editorEnabled = true;
    $scope.stud_profile_backup = angular.copy($scope.stud_info);
  };

  $scope.profile_disableEditor = function() {
    $scope.p_editorEnabled = false;
    $scope.stud_info = angular.copy($scope.stud_profile_backup);
  };

  $scope.saveStudInfo = function(){
    if($scope.stud_info.full_name != null){
      var aoi = "";
      var skill = "";
      if($scope.stud_info.aoi != null){
        aoi = $scope.stud_info.aoi.trim();
      }
      if($scope.stud_info.skill != null){
        skill = $scope.stud_info.skill.trim();
      }
      var data = {'method':"update_stud_profile",
        'stud_aoi': aoi,
        'stud_fyp': $scope.stud_info.fyp,
        'stud_skill': skill,
        'stud_full_name': $scope.stud_info.full_name};

      $scope.Model.send(data, function(response){
        $scope.stud_info = response.user_profile;
        $scope.p_editorEnabled = false;
        
        //$scope.alerts.push({type:'success', msg: "Your profile information is successfully saved! :)"});        
        $scope.studOpen = false;
        $scope.addAlert("success","Your profile information is successfully saved!",10000);
      });
    }
    else{
      $scope.addAlert("error","Profile not updated. Please make sure [Full Name] is not a blank field.",10000);
    }
  };

  $scope.createTeam = function(){

    if($scope.teamName != null){
      var data = {'method':"createTeam",
        't_name': $scope.teamName};

      $scope.Model.send(data, function(response){
        $scope.stud_team = response;
        $scope.gotTeam = true;
        $scope.getStudFinding();
        $scope.teamName = "";
        $scope.isLeader = true;
        $scope.getTeamRecruit();
        $scope.team_got_member = false;
        alert("Team created.");
      });
    }
    else{
      alert("Team not created. Please check for blank field.");
    }
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
      else{
        $scope.team_got_member = false;
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
      if(stud_team.member != null){
        $scope.team_got_member = true;
      }
      else{
        $scope.team_got_member = false;
      }
      $scope.getStudFinding();
    });
  };

  $scope.leaveTeam = function(){
    var data = {'method':"leave_team"};

    $scope.Model.send(data, function(response){
      $scope.stud_team = response;
      $scope.getTeamRecruit();
      $scope.gotTeam = false;
      $scope.team_got_member = false;
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
    if($scope.stud_team.name != null){
      var data = {'method':"update_team",
                  'teamid': $scope.stud_team.teamid,
                  'name': $scope.stud_team.name,
                  'aoi': $scope.stud_team.aoi,
                  'fyp': $scope.stud_team.fyp,
                  'searching': $scope.stud_team.searching,
                  'wiki':$scope.stud_team.wiki,
                  'position':$scope.stud_team.position
                  };
      $scope.Model.send(data, function(response){
        $scope.editorEnabled = false;
        alert("Team info updated!");
      });
    }
    else{
      alert("Team info not updated. Please make sure Team Name is not blank.");
    }
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
      $scope.team_got_member = true;
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
        $scope.team_got_member = true;
      }
      if(response.isLeader == "true"){
        $scope.isLeader = true;
      }
      $scope.getStudTeam();
      $scope.getTeamRecruit();
    });
  };

  $scope.saveClientInfo = function(){
    $scope.user_profile.full_name = $scope.user_profile.full_name.trim();
    $scope.user_profile.website = $scope.user_profile.website.trim();
    if($scope.user_profile.full_name != null){
      if($scope.user_profile.website != null){
        var data = {'method':"update_cpr_profile",
                'full_name':$scope.user_profile.full_name,
                'website':$scope.user_profile.website};
        $scope.Model.send(data,function(response){
          $scope.addAlert("success", "Your profile information is successfully saved!",10000);
        });
      }
      else{
        $scope.addAlert("error", "Profile not updated. Please make sure [Website] is not a blank field.",10000);
      }
    }
    else{
      $scope.addAlert("error", "Profile not updated. Please make sure [Full Name] is not a blank field.",10000);
    }

    $scope.clientOpen = false;
    
  };

  $scope.open = function () {
    if($scope.isClient){
      $scope.clientOpen = true;
      $scope.user_profile_backup = angular.copy($scope.user_profile);
    }
    else{
      $scope.studOpen = true;
      $scope.stud_info_backup = angular.copy($scope.stud_info);
    }
    
  };

  $scope.close = function () {
    if($scope.isClient){
      $scope.clientOpen = false;
      $scope.user_profile = angular.copy($scope.user_profile_backup);
    }
    else{
      $scope.studOpen = false;
      $scope.stud_info = angular.copy($scope.stud_info_backup);
    }
  };

  $scope.opts = {
    backdropFade: true,
    dialogFade:true
  };

    $scope.alerts = [

  ];

  $scope.addAlert = function(type,message,timeout) {
    
    var alert = {type: type , msg: message};    
    $scope.alerts.push(alert);
    
    if (timeout) {
      $timeout(function(){
        $scope.closeAlert($scope.alerts.indexOf(alert));
      }, timeout);
    }
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };



  $scope.checkLogin();
}

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
//Client Ctrl
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
function ClientCtrl($scope,$resource,$http,$timeout){

  String.prototype.trim = function () {
    //return this.replace(/^\s*/, "").replace(/\s*$/, "");
    return this.replace(/^\s+|\s+$/g,'');
  };

  $scope.Model = $resource("http://osmosisgal.appspot.com/:method",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );

  $scope.alerts = [];
  $scope.user_profile;
  $scope.user_profile_backup;
  $scope.editorEnabled = false;
  $scope.have_project = false;
  $scope.client_proj;
  $scope.proj_backup;
  $scope.proj_key;
  $scope.display_name = "Anonymous";
  $scope.home_link = "student-page.html";
  $scope.project_modal_detail = {};
  $scope.project_modal_key = {};
  $scope.exposure_tags;
  $scope.rskill_tags;
  $scope.cp_tech;
  $scope.cp_c_email;
  $scope.cp_rskills;
  $scope.cp_desc;
  $scope.project_te = [];
  $scope.project_rs = [];
  $scope.project_email = [];
  $scope.opts = {
    backdropFade: true,
    dialogFade:true
  };

  $scope.isLogin = false;

  $scope.sample_proj = {
    'name': "My Sample Project: Building an Interactive Webpage",
    'description': "This project requires student to work on building a interactive webpage where users no longer need to think and understand how to use the webpage, but rather the elements of the webpage will guide the user along such as tutorials and basic validation of forms.",
    'exposure': "javascript",
    'company': "Sample Co.",
    'poc': "Sam Pearl",
    'email': "sam.pearl@sample.com",
    'number': "72673275",
    'teamsize':"5",
    'img':"http://i48.tinypic.com/2s01kxw.jpg",
    'video':"http://goanimate.com/player/embed/06SjLQlMMr3M",
    'rskill': "javascript,css,html",
    'outcome': "Expect Deployment"
  };

  $("#editor_tag").tagsManager({
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
                hiddenTagListName: 'editor_tech'
            });
  $("#rskill_tag").tagsManager({
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
                hiddenTagListName: 'editor_rskill'
            });

  $scope.proj_editor = null;

  $scope.checkLogin = function(){
    $scope.Model.send({'method':"check_login"},function(response){
      if (response.result == "true" && response.user_type == "cpr"){
        $scope.isLogin = true;
        $scope.user_profile = response.user_profile;
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

  $scope.saveClientInfo = function(){
    $scope.user_profile.full_name = $scope.user_profile.full_name.trim();
    $scope.user_profile.website = $scope.user_profile.website.trim();
    if($scope.user_profile.full_name != null){
      if($scope.user_profile.website != null){
        var data = {'method':"update_cpr_profile",
                'full_name':$scope.user_profile.full_name,
                'website':$scope.user_profile.website};
        $scope.Model.send(data,function(response){
          $scope.addAlert("success", "Your profile information is successfully saved!",10000);
        });
      }
      else{
        $scope.addAlert("error", "Profile not updated. Please make sure [Website] is not a blank field.",10000);
      }
    }
    else{
      $scope.addAlert("error", "Profile not updated. Please make sure [Full Name] is not a blank field.",10000);
    }

    $scope.shouldBeOpen = false;
    
  };

  $scope.getClientProj = function(){
    $scope.Model.send({'method':"get_cpr_proj"}, function(response){
      var projects = response.proj;
      if(projects.length > 0){
        for(var i = 0; i < projects.length; i++){
          if(projects[i].email != null){
            projects[i].email = projects[i].email.split(",");
          }
        }
        $scope.have_project = true;
        $scope.client_proj = projects;
      }
      else{
        $scope.have_project = false;
      }
    });
  };

  $scope.confirmProj = function(){
    $scope.cp_tech = document.getElementsByName("tech")[0].value;
    $scope.cp_rskills = document.getElementsByName("rskills")[0].value;
    if($scope.cp_tech){
      $scope.project_te = $scope.cp_tech.split(",");
    }
    if($scope.cp_rskills){
      $scope.project_rs = $scope.cp_rskills.split(",");
    }
    $scope.cp_desc = editor.getValue();
    //var nodeArray = [];
    //for (var i = 0; i < node.length; ++i) {
     //   nodeArray[i] = node[i];
    //}
    //var tech = nodeArray.toString();
    $scope.cp_c_email = "";
    var errorStr = "";
    if($scope.contactEmail != null){
      if($scope.contactEmail instanceof Array){
        $scope.cp_c_email = $scope.contactEmail.join();
        $scope.cp_c_email = $scope.cp_c_email.trim();
        $scope.project_email = $scope.contactEmail;
      }
      else{
        $scope.cp_c_email = $scope.contactEmail.trim();
        $scope.project_email = $scope.contactEmail.split(",");
      }
    }
    if($scope.projectName == null){
      errorStr += "\nProject Name is blank.";
    } 
    if($scope.contactEmail == null){
      errorStr += "\nContact Email is blank.";
    }
    if($scope.contactNumber == null){
      errorStr += "\nContact Number is blank.";
    }
    else if($scope.contactNumber.match("[0-9]{8}") == null){
      errorStr += "\nMake sure Contact Number is of 8 digits.";
    }
    if(errorStr != ""){
      $scope.addAlert("error","Project could not be created." + errorStr,10000);
      return false;
    }
    if($scope.project_modal_detail.img == "undefined" || $scope.project_modal_detail.img == "" ){
      $scope.isBlank = true;
    }
    else{
      $scope.isBlank = false;
    }
    $scope.createProjModal = true;
  };

  $scope.cancelCreateProj = function(){
    $scope.createProjModal = false;
    $scope.project_te = [];
    $scope.project_rs = [];
  };

  $scope.createProj = function(){
    $scope.createProjModal = false;
    var data = {'method':"create_proj",
    'title':$scope.projectName,
    'description': $scope.cp_desc,
    'exposure': $scope.cp_tech,
    'teamsize': $scope.teamsize,
    'poc':$scope.contactPerson,
    'email': $scope.cp_c_email,
    'company':$scope.companyName,
    'contact':$scope.contactNumber,
    'img': $scope.projImg,
    'video': $scope.projVideo,
    'rskill': $scope.cp_rskills,
    'outcome': $scope.projectOutcome};
    //
    //
    $scope.Model.send(data, function(response){
      var project = response.proj;
      if(project.email != null){
        project.email = project.email.split(",");
      }
      $scope.client_proj.push(project);
      $scope.have_project = true;
      $scope.project_te = [];
      $scope.project_rs = [];
      $('#mainAccordion').load();
      alert("Project Created!");
      $scope.reset();
      return false;
    });
  };

  $scope.copyToForm = function(key){
    var project = angular.copy($scope.client_proj[key]);
    jQuery('input[name=tech]').empty().remove();
    jQuery('input[name=rskills]').empty().remove();
    jQuery('.myTag').empty().remove();
    $scope.projectName = project.title;
    $scope.projectObjective = project.description;
    editor.setValue(project.description);
    $scope.projectOutcome = project.outcome;
    $scope.companyName = project.company;
    $scope.contactPerson = project.poc;
    $scope.contactEmail = project.email;
    $scope.contactNumber = project.contact;
    $scope.teamsize = project.teamsize;
    $scope.projImg = project.img;
    $scope.projVideo = project.video;
    $scope.close_project_modal();

    $("#technologiesExposure").tagsManager({
                prefilled: project.exposure.split(","),
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
    $("#requiredSkill").tagsManager({
                prefilled: project.rskill.split(","),
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
  };

  $scope.enableEditor = function(key,proj_id) {
    $scope.exposure_tags = $scope.project_modal_detail.exposure.split(",");
    $scope.rskill_tags = $scope.project_modal_detail.rskill.split(",");
    $scope.editorEnabled = true;
    $scope.proj_key = key;
    $scope.proj_backup = angular.copy($scope.client_proj[key]);
    $scope.client_proj[key].email = $scope.client_proj[key].email.join();
    if($scope.proj_editor == null){
      $scope.proj_editor = new wysihtml5.Editor("po_modal", { // id of textarea element
                      toolbar:      "potb_modal", // id of toolbar element
                      parserRules:  wysihtml5ParserRules // defined in parser rules set 
                    });
    }
    $scope.proj_editor.setValue = $scope.client_proj[key].description;

    //do a prefilled for the tags in modal
    $("#editor_tag").tagsManager({
                prefilled: $scope.exposure_tags,
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
                hiddenTagListName: 'editor_tech'
            });

    $("#rskill_tag").tagsManager({
                prefilled: $scope.rskill_tags,
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
                hiddenTagListName: 'editor_rskill'
            });

    //set the hidden value
    // document.getElementsByName("editor_tech")[0].value = $scope.client_proj[key].exposure;
  };

  $scope.disableEditor = function() {
    $scope.editorEnabled = false;
    if($scope.proj_key != null){
      $scope.client_proj[$scope.proj_key] = angular.copy($scope.proj_backup);
      $scope.project_modal_detail = $scope.client_proj[$scope.proj_key];
      $scope.proj_key = null;
    }
    $scope.exposure_tags = [];
    jQuery('input[name=editor_tech]').empty().remove();
    $scope.rskill_tags = [];
    jQuery('input[name=editor_rskill]').empty().remove();
    jQuery('.myTag').empty().remove();
    $scope.proj_editor = null;

    var tech = $scope.project_modal_detail.exposure;
    var rskills = $scope.project_modal_detail.rskill;
    if(tech){
      $scope.project_te = tech.split(",");
    }
    if(rskills){
      $scope.project_rs = rskills.split(",");
    }
    //jQuery('.wysihtml5-sandbox').empty().remove();
    // jQuery(".editor_tech").remove();
    // jQuery(".myTag").remove();
  };

  $scope.saveProj = function(key,proj_id) {
    var project = $scope.client_proj[key];
    var tech = "";
    var rskills = "";
    var c_email = "";
    var po = "po_" + proj_id;
    var potb = "potb_" + proj_id;
    if(document.getElementsByName("editor_tech")[0].value != null){
      tech = document.getElementsByName("editor_tech")[0].value.trim();
      project.exposure = tech;
      $scope.exposure_tags = tech.split(",");
    }
    if(document.getElementsByName("editor_rskill")[0].value != null){
      rskills = document.getElementsByName("editor_rskill")[0].value.trim();
      project.rskill = rskills;
      $scope.rskill_tags = rskills.split(",");
    }

    $scope.exposure_tags = [];
    jQuery('input[name=editor_tech]').empty().remove();
    $scope.rskill_tags = [];
    jQuery('input[name=editor_rskill]').empty().remove();
    jQuery('.myTag').empty().remove();

    var tech = $scope.project_modal_detail.exposure;
    var rskills = $scope.project_modal_detail.rskill;
    if(tech){
      $scope.project_te = tech.split(",");
    }
    if(rskills){
      $scope.project_rs = rskills.split(",");
    }

    if(project.email != null){
      c_email = project.email.trim();
    }

    var p_desc = $scope.proj_editor.getValue();

    project.description = p_desc;

    var data = {'method':"update_proj",
                'proj_id': proj_id,
                'ptitle': project.title,
                'pdescription': p_desc,
                'pexposure': tech,
                'pcompany': project.company,
                'pteamsize':project.teamsize,
                'ppoc': project.poc,
                'pemail': c_email,
                'pcontact': project.contact,
                'pimg':project.img,
                'pvideo':project.video,
                'prskill': rskills,
                'poutcome': project.outcome};
    $scope.Model.send(data, function(response){
      if(project.email != null){
        project.email = project.email.split(",");
      }
      $scope.proj_key = null;
      $scope.editorEnabled = false;
      alert("Project Info Updated!");
    });

    // $http.post("http://osmosisgal.appspot.com/update_proj", {'method':"update_proj",
    //             'proj_id': proj_id,
    //             'ptitle': project.title,
    //             'pdescription': p_desc,
    //             'pexposure': tech,
    //             'pcompany': project.company,
    //             'pteamsize':project.teamsize,
    //             'ppoc': project.poc,
    //             'pemail': c_email,
    //             'pcontact': project.contact,
    //             'pimg':project.img,
    //             'pvideo':project.video,
    //             'prskill': rskills,
    //             'poutcome': project.outcome}, {'headers':{'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}})
    // .success(function(data,status){
    //   if(project.email != null){
    //     project.email = project.email.split(",");
    //   }
    //   $scope.proj_key = null;
    //   $scope.editorEnabled = false;
    //   alert("Project Info Updated!");
    // });
  };
  
  $scope.reload_img_video = function(key){
    $("#"+key).load();
  };

  $scope.open = function () {
    $scope.shouldBeOpen = true;
    $scope.user_profile_backup = angular.copy($scope.user_profile);
  };

  $scope.close = function () {
    $scope.shouldBeOpen = false;
    $scope.user_profile = angular.copy($scope.user_profile_backup);
  };

  $scope.displayProjModal = function(key){
    $scope.project_modal_detail = $scope.client_proj[key];
    var tech = $scope.project_modal_detail.exposure;
    var rskills = $scope.project_modal_detail.rskill;
    if(tech){
      $scope.project_te = tech.split(",");
    }
    if(rskills){
      $scope.project_rs = rskills.split(",");
    }
    if($scope.project_modal_detail.img == "undefined" || $scope.project_modal_detail.img == "" ){
      $scope.isBlank = true;
    }
    else{
      $scope.isBlank = false;
    }
    $scope.project_modal_key = key;
    $scope.openProjModal = true;
  };

  $scope.close_project_modal = function(){
    //$scope.view_project_detail = "";
    $scope.project_modal_detail = "";
    $scope.project_modal_key = "";
    $scope.openProjModal = false;
    if($scope.editorEnabled){
      $scope.disableEditor();
    }
  }

	$scope.reset = function() {
    $scope.projectName = "";
    $scope.projectObjective = "";
    $scope.technologiesExposure ="";
    $scope.companyName = "";
    $scope.contactPerson = "";
    $scope.contactEmail = "";
    $scope.contactNumber = "";
    $scope.teamsize = "";
    $scope.projImg = "";
    $scope.projVideo = "";
    editor.setValue("");
    jQuery('input[name=tech]').empty().remove();
    jQuery('input[name=rskills]').empty().remove();
    jQuery('.myTag').empty().remove();
    $("#technologiesExposure").tagsManager({
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
    $("#requiredSkill").tagsManager({
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
  };

  $scope.removeProj = function(proj_id, key){
    var data = {'method':"delete_proj",
                'proj_id':proj_id};
    $scope.Model.send(data, function(response){
      if (response.result){
        $scope.client_proj.splice(key,1);
        if($scope.client_proj.length == 0){
          $scope.have_project = false;
        }
        $scope.close_project_modal();
        $('#mainAccordion').load();
      }
    });
  };

  $scope.genSampleProj = function(){

    jQuery('input[name=tech]').empty().remove();
    jQuery('input[name=rskills]').empty().remove();
    jQuery('.myTag').empty().remove();
    $scope.projectName = $scope.sample_proj.name;
    editor.setValue($scope.sample_proj.description);
    $scope.companyName = $scope.sample_proj.company;
    $scope.contactPerson = $scope.sample_proj.poc;
    $scope.contactEmail = $scope.sample_proj.email;
    $scope.contactNumber = $scope.sample_proj.number;
    $scope.teamsize = $scope.sample_proj.teamsize;
    $scope.projImg = $scope.sample_proj.img;
    $scope.projVideo = $scope.sample_proj.video;
    $scope.projectOutcome = $scope.sample_proj.outcome;

    $("#technologiesExposure").tagsManager({
                prefilled: $scope.sample_proj.exposure.split(","),
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
    $("#requiredSkill").tagsManager({
                prefilled: $scope.sample_proj.rskill.split(","),
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
  };

  $scope.addAlert = function(type,message,timeout) {
    
    var alert = {type: type , msg: message};    
    $scope.alerts.push(alert);
    
    if (timeout) {
      $timeout(function(){
        $scope.closeAlert($scope.alerts.indexOf(alert));
      }, timeout);
    }
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  // $scope.createCORSRequest = function (method, url) {
  //   var xhr = new XMLHttpRequest();
  //   if ("withCredentials" in xhr) {

  //     // Check if the XMLHttpRequest object has a "withCredentials" property.
  //     // "withCredentials" only exists on XMLHTTPRequest2 objects.
  //     xhr.open(method, url, true);

  //   } else if (typeof XDomainRequest != "undefined") {

  //     // Otherwise, check if XDomainRequest.
  //     // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
  //     xhr = new XDomainRequest();
  //     xhr.open(method, url);

  //   } else {

  //     // Otherwise, CORS is not supported by the browser.
  //     xhr = null;

  //   }
  //   return xhr;
  // };


  // $scope.isLinkValid = function(url){
  //   var xhr = $scope.createCORSRequest('GET', url);

  //   if (!xhr) {
  //     throw new Error('CORS not supported');
  //   }

  //   xhr.onload = function(){
  //     return true;
  //   };

  //   xhr.onerror = function() {
  //     return false;
  //   };

  //   xhr.send();
  // };

  $scope.checkLogin();
}

ClientCtrl.$inject = ['$scope','$resource','$http','$timeout'];
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
//Project Ctrl
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
function ProjectCtrl($scope,$resource,$timeout){
  String.prototype.trim = function () {
    //return this.replace(/^\s*/, "").replace(/\s*$/, "");
    return this.replace(/^\s+|\s+$/g,'');
  };

  $scope.Model = $resource("http://osmosisgal.appspot.com/:method",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );

  $scope.quickSort = function(array, left, right){
    var pivot = null;
   
    if(typeof left !== 'number') {
      left = 0;
    }
 
    if(typeof right !== 'number') {
      right = array.length - 1;
    }
 
    // effectively set our base
    // case here. When left == right
    // we'll stop
    if(left < right) {
 
      // pick a pivot between left and right
      // and update it once we've partitioned
      // the array to values < than or > than
      // the pivot value
      pivot     = left + Math.ceil((right - left) * 0.5);
      var newPivot  = $scope.partition(array, pivot, left, right);
 
      // recursively sort to the left and right
      $scope.quickSort(array, left, newPivot - 1);
      $scope.quickSort(array, newPivot + 1, right);
    }
  };

  $scope.partition = function(array, pivot, left, right){
    var storeIndex = left,
        pivotValue = array[pivot][1];
 
    // put the pivot on the right
    $scope.swap(array, pivot, right);
 
    // go through the rest
    for(var v = left; v < right; v++) {
 
      // if the value is less than the pivot's
      // value put it to the left of the pivot
      // point and move the pivot point along one
      if(array[v][1] > pivotValue) {
        $scope.swap(array, v, storeIndex);
        storeIndex++;
      }
    }
 
    // finally put the pivot in the correct place
    $scope.swap(array, right, storeIndex);
 
    return storeIndex;
  };

  $scope.swap = function(array, indexA, indexB){
    var temp = array[indexA];
    array[indexA] = array[indexB];
    array[indexB] = temp;
  };

  $scope.user_info;
  $scope.user_profile;
  $scope.user_profile_backup;
  $scope.home_link;
  $scope.isLogin = false;
  $scope.avail_proj;
  $scope.stud_info;
  $scope.stud_info_backup;
  $scope.stud_team;
  $scope.projects;
  $scope.projRank = [];
  $scope.isClient = false;
  $scope.forClient;
  $scope.project_modal_detail = {};
  $scope.project_modal_key = {};
  $scope.project_te = [];
  $scope.project_rs = [];

  $scope.getStudTeam = function(){
    $scope.Model.send({'method':"get_user_team"}, function(response){
      $scope.stud_team = response;
      $scope.rankProj();
    });
  };

  $scope.rankProj = function(){
    $scope.Model.send({'method':"get_profile"}, function(response){
      if(response.user_type == "std"){
        var toBeReturn = [];
        var member = $scope.stud_team.member;
        
        //get leader/individual skills + interest
        var stud_aoi = [];
        var stud_skill = [];
        var stud = $scope.user_info.user_profile;
        if (stud.aoi != null){
          stud_aoi = stud.aoi.split(",");
        }
        if (stud.skill != null){
          stud_skill = stud.skill.split(",");
        }

        //Collating weight average pts
        //each project available
        for (var p in $scope.avail_proj){
          var temp_proj = $scope.avail_proj[p];
          var skillHash = {};
          var proj_exposure = [];
          if(temp_proj.exposure != null){
            proj_exposure = temp_proj.exposure.split(",");
          }

          //DO a collate for team members(if there is), AS LEADER IS SEPERATED
          if (member != null){
          //each member in current student team
            for (var m in member){
              var mem_skill = [];
              if (member[m].skill != null){
                mem_skill = member[m].skill.split(",");
              }
              //each skill of member
              for (var s in mem_skill){
                //see if skill of member matches any exposure in project
                //do a count++
                if (jQuery.inArray(mem_skill[s],proj_exposure) != -1){
                  var count = skillHash[mem_skill[s]];
                  if (count == null){count = 0;}
                  count++;
                  skillHash[mem_skill[s]] = count;
                }
              }
              var mem_int = [];
              if (member[m].aoi != null){
                mem_int = member[m].aoi.split(",");
              }
              //each interest of member
              for (var i in mem_int){
                //see if interest of member matches any exposure in project
                //do a count++
                if (jQuery.inArray(mem_int[i],proj_exposure) != -1){
                  var count = skillHash[mem_int[i]];
                  if (count == null){count = 0;}
                  count++;
                  skillHash[mem_int[i]] = count;
                }
              }
            }
          }//END OF TEAM MEMBER COLLATE

          //Do a collate for leader
          for (var s in stud_skill){
            var temp_skill = stud_skill[s];
            //see if skill of student matches any exposure in project
            //do a count++
            var num = jQuery.inArray(temp_skill,proj_exposure);
            if (jQuery.inArray(temp_skill,proj_exposure) != -1){
              var count = skillHash[temp_skill];
              if (count == null){count = 0;}
              count++;
              skillHash[temp_skill] = count;
            }
          }
          //each interest of student
          for (var i in stud_aoi){
            var temp_aoi = stud_aoi[i];
            //see if interest of student matches any exposure in project
            //do a count++
            var num = jQuery.inArray(temp_aoi,proj_exposure);
            if (jQuery.inArray(temp_aoi,proj_exposure) != -1){
              var count = skillHash[temp_aoi];
              if (count == null){count = 0;}
              count++;
              skillHash[temp_aoi] = count;
            }
          }

          //get all keys of hashmap, find sum of all weight
          var skillHashKey = Object.keys(skillHash);
          var totalMatchCount = 0;
          for (var shk in skillHashKey){
            totalMatchCount += skillHash[skillHashKey[shk]];
          }
          //find the average weight and put inside project rank
          var avgWeight = 0;
          if(totalMatchCount != 0 && skillHashKey.length != 0){
            if(member != null){
              avgWeight = parseFloat(totalMatchCount / (member.length + 1));
            }
            else{
              avgWeight = parseFloat(totalMatchCount / 1);
            }
            avgWeight = parseFloat(avgWeight / proj_exposure.length);
            avgWeight = avgWeight.toFixed(2);
          }
          $scope.projRank.push([temp_proj,avgWeight]);
          //END OF LEADER COLLATE
        }

        $scope.quickSort($scope.projRank);
        for(var i = 0; i < $scope.projRank.length; i++){
          toBeReturn[i] = $scope.projRank[i][0]
        }
        $scope.avail_proj = toBeReturn;
      }
    });
  };

  $scope.getAvailProj = function(){
    $scope.Model.send({'method':"get_available_project"}, function(response){
      $scope.projects = response.proj;

      for(var i = 0; i < $scope.projects.length; i++){
        if($scope.projects[i].email != null){
          $scope.projects[i].email = $scope.projects[i].email.split(",");
        }
      }
      $scope.avail_proj = $scope.projects;
      if($scope.user_info.user_type == "std"){
        $scope.getStudTeam();
      }
      else{
        $scope.forClient = $scope.avail_proj;
      }
    });
  };

  $scope.launchVideo = function(key){
    var project;
    var proj_video;
    if($scope.user_info.user_type == "std"){
      project = $scope.projRank[key];
      proj_video = project[0].video;
    }
    else{
      project = $scope.forClient[key];
      proj_video = project.video;
    }
    $scope.watch_video = '<iframe class="project_video"allowTransparency="true" scrolling="no" style:"width:100%;height:100%;" src="' + proj_video + '" frameborder="0" allowfullscreen></iframe>';
  };

  $scope.close_video = function(){
    $scope.watch_video = "";
  }

  $scope.displayProjModal = function(usertype, key){
    if(usertype == "std"){
      $scope.project_modal_detail = $scope.projRank[key][0];
    }
    else{
      $scope.project_modal_detail = $scope.forClient[key];
    }
    if($scope.project_modal_detail.img == "undefined" || $scope.project_modal_detail.img == "" ){
      $scope.isBlank = true;
    }
    else{
      $scope.isBlank = false;
    }
    if($scope.project_modal_detail.exposure){
      $scope.project_te = $scope.project_modal_detail.exposure.split(",");
    }
    if($scope.project_modal_detail.rskill){
      $scope.project_rs = $scope.project_modal_detail.rskill.split(",");
    }
    $scope.project_modal_key = key;
    $scope.openProjModal = true;
  };

  $scope.close_project_modal = function(){
    //$scope.view_project_detail = "";
    $scope.project_modal_detail = "";
    $scope.project_modal_key = "";
    $scope.openProjModal = false;
  }

  $scope.clientSearchFunction = function(val){
    //return !!((val.exposure.indexOf($scope.nameFilter || '') !== -1));
    var namef = "";
    var descf = "";
    var expof = "";
    var companyf = "";
    var conperf = "";
    if($scope.nameFilter != null){namef = $scope.nameFilter.toLowerCase();}
    if($scope.descFilter != null){descf = $scope.descFilter.toLowerCase();}
    if($scope.expoFilter != null){expof = $scope.expoFilter.toLowerCase();}
    if($scope.companyFilter != null){companyf = $scope.companyFilter.toLowerCase();}
    if($scope.conPerFilter != null){conperf = $scope.conPerFilter.toLowerCase();}

    var vname = "";
    var vdesc = "";
    var vexpo = "";
    var vcompany = "";
    var vconper = "";
    if(val.title != null){vname = val.title.toLowerCase();}
    if(val.description != null){vdesc = val.description.toLowerCase();}
    if(val.exposure != null){vexpo = val.exposure.toLowerCase();}
    if(val.company != null){vcompany = val.company.toLowerCase();}
    if(val.poc != null){vconper = val.poc.toLowerCase();}

    if((vname.indexOf(namef || '') !== -1)&&
      (vdesc.indexOf(descf || '') !== -1)&&
      (vexpo.indexOf(expof || '') !== -1)&&
      (vcompany.indexOf(companyf || '') !== -1)&&
      (vconper.indexOf(conperf || '') !== -1)//&&
      //(val.email.indexOf($scope.emailFilter || '') != -1)//&&
      //(val.contact.toLowerCase().indexOf($scope.conNumFilter.toLowerCase() || '') !== -1)
      ){
      return true;
    }
    return false;
  };

  $scope.studentSearchFunction = function(val){
    //return !!((val.exposure.indexOf($scope.nameFilter || '') !== -1));
    var namef;
    var descf;
    var expof;
    var companyf;
    var conperf;
    if($scope.nameFilter != null){namef = $scope.nameFilter.toLowerCase();}
    if($scope.descFilter != null){descf = $scope.descFilter.toLowerCase();}
    if($scope.expoFilter != null){expof = $scope.expoFilter.toLowerCase();}
    if($scope.companyFilter != null){companyf = $scope.companyFilter.toLowerCase();}
    if($scope.conPerFilter != null){conperf = $scope.conPerFilter.toLowerCase();}
    
    var vname;
    var vdesc;
    var vexpo;
    var vcompany;
    var vconper;
    if(val[0].title != null){vname = val[0].title.toLowerCase();}
    if(val[0].description != null){vdesc = val[0].description.toLowerCase();}
    if(val[0].exposure != null){vexpo = val[0].exposure.toLowerCase();}
    if(val[0].company != null){vcompany = val[0].company.toLowerCase();}
    if(val[0].poc != null){vconper = val[0].poc.toLowerCase();}

    if((vname.indexOf(namef || '') !== -1)&&
      (vdesc.indexOf(descf || '') !== -1)&&
      (vexpo.indexOf(expof || '') !== -1)&&
      (vcompany.indexOf(companyf || '') !== -1)&&
      (vconper.indexOf(conperf || '') !== -1)//&&
      //(val.email.indexOf($scope.emailFilter || '') != -1)//&&
      //(val.contact.toLowerCase().indexOf($scope.conNumFilter.toLowerCase() || '') !== -1)
      ){
      return true;
    }
    return false;
  };

  $scope.checkLogin = function(){
    $scope.Model.send({'method':"check_login"},function(response){
      if (response.result == "true"){
        $scope.user_info = response;
        $scope.isLogin = true;
        if(response.user_type == "cpr"){
          $scope.isClient = true;
          $scope.home_link = "client-page.html"
          if (response.user_profile.full_name != null){
            $scope.display_name = response.user_profile.full_name;
          }
        }
        else{
          $scope.isClient = false;
          $scope.home_link = "student-page.html"
          $scope.stud_info = response.user_profile;
          $scope.display_name = response.user_profile.email;
        }
        $scope.getAvailProj();
      }
      else{
        window.location = "http://osmosisgalaxy.github.com/Osmosis/login.html";
      }
    });
  };

  $scope.saveClientInfo = function(){
    $scope.user_profile.full_name = $scope.user_profile.full_name.trim();
    $scope.user_profile.website = $scope.user_profile.website.trim();
    if($scope.user_profile.full_name != null){
      if($scope.user_profile.website != null){
        var data = {'method':"update_cpr_profile",
                'full_name':$scope.user_profile.full_name,
                'website':$scope.user_profile.website};
        $scope.Model.send(data,function(response){
          $scope.addAlert("success", "Your profile information is successfully saved!",10000);
        });
      }
      else{
        $scope.addAlert("error", "Profile not updated. Please make sure [Website] is not a blank field.",10000);
      }
    }
    else{
      $scope.addAlert("error", "Profile not updated. Please make sure [Full Name] is not a blank field.",10000);
    }

    $scope.clientOpen = false;
    
  };

  $scope.saveStudInfo = function(){
    if($scope.stud_info.full_name != null){
      var aoi = "";
      var skill = "";
      if($scope.stud_info.aoi != null){
        aoi = $scope.stud_info.aoi.trim();
      }
      if($scope.stud_info.skill != null){
        skill = $scope.stud_info.skill.trim();
      }
      var data = {'method':"update_stud_profile",
        'stud_aoi': aoi,
        'stud_fyp': $scope.stud_info.fyp,
        'stud_skill': skill,
        'stud_full_name': $scope.stud_info.full_name};

      $scope.Model.send(data, function(response){
        $scope.stud_info = response.user_profile;
        $scope.p_editorEnabled = false;
        
        //$scope.alerts.push({type:'success', msg: "Your profile information is successfully saved! :)"});        
        $scope.studOpen = false;
        $scope.addAlert("success","Your profile information is successfully saved!",10000);
      });
    }
    else{
      $scope.addAlert("error","Profile not updated. Please make sure [Full Name] is not a blank field.",10000);
    }
  };

  $scope.addAlert = function(type,message,timeout) {
    
    var alert = {type: type , msg: message};    
    $scope.alerts.push(alert);
    
    if (timeout) {
      $timeout(function(){
        $scope.closeAlert($scope.alerts.indexOf(alert));
      }, timeout);
    }
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.open = function () {
    if($scope.isClient){
      $scope.clientOpen = true;
      $scope.user_profile_backup = angular.copy($scope.user_profile);
    }
    else{
      $scope.studOpen = true;
      $scope.stud_info_backup = angular.copy($scope.stud_info);
    }
    
  };

  $scope.close = function () {
    if($scope.isClient){
      $scope.clientOpen = false;
      $scope.user_profile = angular.copy($scope.user_profile_backup);
    }
    else{
      $scope.studOpen = false;
      $scope.stud_info = angular.copy($scope.stud_info_backup);
    }
  };

  $scope.checkLogin();
}