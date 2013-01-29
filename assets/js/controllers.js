'use strict';

/* Controllers */

function LoginCtrl($scope,$resource){
  $scope.Model = $resource("http://galaxy-osmosis.appspot.com/db/link",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );
    $scope.login_url;
    $scope.nickname;
    $scope.getLink = function(){

      $scope.Model.send({}, function(response){

        $scope.login_url = response.login_url;
        $scope.nickname = response.nickname;
      });
    };

    $scope.getLink();
}

function UserTypeCtrl($scope,$resource){
  $scope.Model = $resource("http://galaxy-osmosis.appspot.com/db/:ut_method",
    {},
    {"send": {method: 'JSONP', isArray: false, params: {callback: 'JSON_CALLBACK'}}}
    );
  $scope.haha = "abc";
  $scope.updateUserType_C = function(){

    $scope.Model.send({'user_type':"cpr",'ut_method':'set_user_type_c'},function(response){$scope.haha=response.redirect_url;});
  };

  $scope.updateUserType_I = function(){

    $scope.Model.send({'user_type':"ind",'ut_method':'set_user_type_i'},function(response){location.href=response.redirect_url;});
  };
}

function SignupCtrl($scope,$resource){

        $scope.Model = $resource('http://galaxy-osmosis.appspot.com/:user_type/:ftn',
                                {},
                                {'send': {method: 'JSONP', isArray: false, params:{callback: 'JSON_CALLBACK'}}}
                        );

        //User sign up
        $scope.signup = function(){
          
          if($scope.user_type == "user"){

              data = {'user_type':$scope.user_type,
                  'ftn':'signup',
                  'email':$scope.new_email,
                  'password':$scope.new_password
              };
          }
          data = {'user_type':$scope.user_type,
                  'ftn':'signup',
                  'reg_num':$scope.new_reg_num,
                  'password':$scope.new_password
          };
                
          $scope.Model.send(data,function(response) {

            $scope.signup_status = response.signup_result;
            
            if($scope.user_type == "user"){

                window.location.href("#/main");
            }

          });

        };
}
