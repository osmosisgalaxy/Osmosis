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
function StudentCtrl($scope,$resource){
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
        if(stud_team.member != null){
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
    $scope.currentpage = 0;
    $('.pp_btn').addClass('disabled');
    $('.pn_btn').removeClass('disabled');
    if($scope.stud_finding_pag[key].length == 1){
      $('.pn_btn').addClass('disabled');
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
        alert("Profile updated.");
      });
    }
    else{
      alert("Profile not updated. Please make sure [Full Name] is not a blank field.");
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

  $scope.checkLogin();
}

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
//Client Ctrl
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
function ClientCtrl($scope,$resource){

  String.prototype.trim = function () {
    //return this.replace(/^\s*/, "").replace(/\s*$/, "");
    return this.replace(/ /g,'');
  };

  $scope.Model = $resource("http://osmosisgal.appspot.com/:method",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );

  $scope.editorEnabled = false;
  $scope.have_project = false;
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

  $scope.createProj = function(){
    var tech = "";
    var c_email = "";
    if($scope.technologiesExposure != null){
      tech = $scope.technologiesExposure.trim();
    }
    if($scope.contactEmail != null){
      if($scope.contactEmail instanceof Array){
        c_email = $scope.contactEmail.join();
        c_email = c_email.trim();
      }
      else{
        c_email = $scope.contactEmail.trim();
      }
    }
    // if($scope.projectName == null || $scope.projectObjective == null || 
    //   $scope.technologiesExposure == null || $scope.contactPerson == null ||
    //   $scope.contactEmail == null || $scope.companyName == null ||
    //   $scope.contactNumber == null)
    if($scope.projectName == null || $scope.contactEmail == null ||
      $scope.contactNumber == null){
      alert("Project cannot be created. Check for blank field.");
      return false;
    }
    if($scope.contactNumber.match("[0-9]{8}") == null){
      alert("Project cannot be created. Make sure contact number is 8 digits.");
      return false;
    }
    var data = {'method':"create_proj",
    'title':$scope.projectName,
    'description': $scope.projectObjective,
    'exposure': tech,
    'poc':$scope.contactPerson,
    'email': c_email,
    'company':$scope.companyName,
    'contact':$scope.contactNumber,
    'img':"http://i48.tinypic.com/2s01kxw.jpg",
    'video':"http://goanimate.com/player/embed/06SjLQlMMr3M"};

    $scope.Model.send(data, function(response){
      var project = response.proj;
      if(project.email != null){
        project.email = project.email.split(",");
      }
      $scope.client_proj.push(project);
      $scope.have_project = true;
      $('#mainAccordion').load();
      alert("Project Created!");
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
    $scope.client_proj[key].email = $scope.client_proj[key].email.join();
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
    var tech = "";
    var c_email = "";
    if(project.exposure != null){
      tech = project.exposure.trim();
    }
    if(project.email != null){
      c_email = project.email.trim();
    }
    var data = {'method':"update_proj",
                'proj_id': proj_id,
                'ptitle': project.title,
                'pdescription': project.description,
                'pexposure': tech,
                'pcompany': project.company,
                'ppoc': project.poc,
                'pemail': c_email,
                'pcontact': project.contact,
                'pimg':project.img,
                'pvideo':project.video};
    $scope.Model.send(data, function(response){
      if(project.email != null){
        project.email = project.email.split(",");
      }
      $scope.proj_key = null;
      $scope.editorEnabled = false;
      alert("Project Info Updated!");
    });
  };
  
  $scope.reload_img_video = function(key){
    $("#"+key).load();
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
        if($scope.client_proj.length == 0){
          $scope.have_project = false;
        }
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
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
//Project Ctrl
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
function ProjectCtrl($scope,$resource){
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
  $scope.home_link;
  $scope.isLogin = false;
  $scope.avail_proj;
  $scope.stud_team;
  $scope.projects;
  $scope.projRank = [];
  $scope.isClient = false;
  $scope.forClient;

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
                mem_int = m.aoi.split(",");
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
            avgWeight = parseFloat(totalMatchCount / skillHashKey.length);
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
          $scope.display_name = response.user_profile.email;
        }
        $scope.getAvailProj();
      }
      else{
        window.location = "http://osmosisgalaxy.github.com/Osmosis/login.html";
      }
    });
  };

  $scope.checkLogin();
}



