
var app = angular.module('userloginApp', ['config','ngCookies','ui-notification'])

app.run(function ($window) {
    if (!(localStorage.token)) {
        window.location.href = '/Admin';
    } else {
        var token = localStorage.token;
    console.log("token", token);
        var encodedProfile = token.split('.')[1];

        var profile = JSON.parse(url_base64_decode(encodedProfile));
        console.log("admin profile", profile);
     //   console.log("profile._doc.civilId" , profile._doc.civilId);
        var profile1 = Object.keys(profile);
        var count = profile1.length;
        console.log("count", count);
        
        console.log("profile1", profile1);
        if (profile.userCategory != 'admin') {
            window.location.href = '/Login';
        } else {
            
        }
    }
});


function url_base64_decode(str) {
    var output = str.replace('-', '+').replace('_', '/');
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += '==';
            break;
        case 3:
            output += '=';
            break;
        default:
            throw 'Illegal base64url string!';
    }
    return window.atob(output);
}

var baseAddress = config_module._invokeQueue[0][2][1].BASE_URL;

var address = config_module._invokeQueue[0][2][1].LOGIN_URL;

var url = "";


app.factory('userloginFactory', function($http,$window) {
    return {
     
		
		
        addUserProfile: function(admin) {
			
            url = address + "signUp/";
            return $http.post(url, admin);
        },
        deleteUserfrom: function (id) {
            url = baseAddress + "DeleteUser/" + id;
            return $http.delete(url);
        }
        
    };
});





app.controller('UserLoginController', function($scope, $http,userloginFactory, $window, $cookies, $cookieStore, $location,Notification) {



// USER REGISTRATION

    $scope.addUser = function() {
        var currentUserProfile = this.admin;
		
		console.log("currentUserProfile", currentUserProfile);
        if (currentUserProfile.emailId != null && currentUserProfile.password != null ) {
				 
            userloginFactory.addUserProfile(currentUserProfile).success(function(data) {
            
            if(data=='ER_DUP_ENTRY'){
            	Notification.error({message: currentUserProfile.emailId+' '+'Already Registered ', delay: null});
            }else{
            
                $scope.addMode = false;
                currentUserProfile = data;
				
               
				Notification.success({message: currentUserProfile.firstName+' '+', Profile Created Successfully ', delay: 1000});

                //reset form
                $scope.admin = null;
               
                //$window.location.reload();
              
             
                 }
            }).error(function(data) {
           
				Notification.error({message: currentUserProfile.fullName+' '+',userProfile Adding Failed ', delay: 1000});
                //$scope.error = "An Error has occured while Adding userProfile! " + data.ExceptionMessage;
            });
        }
    };



//deleteUser
$scope.deleteUser = function (Id) {

    $scope.id = Id;
    console.log("$scope.id",$scope.id);
    userloginFactory.deleteUserfrom(Id).success(function (data) {

        if (data == 'DELETED') {
            Notification.success({
                message: 'User deleted ',
                delay: null
            });
            //Notification.success('Class deleted');
        }
        $window.location.reload();
    }).error(function (data) {
        Notification.error({
            message: ' User Deleting Failed ',
            delay: 1000
        });
})

};
  })


  app.factory('authInterceptor', function ($rootScope, $q, $window) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.localStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
            }
            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 401) {
                window.location.href = '/';
            }
            return $q.reject(rejection);
        }
    };
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});
