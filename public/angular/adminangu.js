
var app = angular.module('adminloginApp', ['config','ngCookies','ui-notification'])


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


var baseAddress = config_module._invokeQueue[0][2][1].LOGIN_URL;


var url = "";

app.factory('beerFactory', function ($http, $window) {

    return {
        
        getBeerList: function () {
            url = baseAddress + "GetBeers";
            return $http.get(url);
        }

    }


})

app.controller('AdminLoginController', function($scope,beerFactory, $http, $window, $cookies, $cookieStore, $location,Notification) {

// USER LOGIN

beerFactory.getBeerList().success(function (data) {
    console.log("data of beers == ", data);
    $scope.Beer = data;
    $scope.beers = [];
    var length1 = $scope.Beer.length;

    for (var i = 0; i < length1; i++) {

        var formBody = {

            name: $scope.Beer[i].name,
            category: $scope.Beer[i].category,
            price: $scope.Beer[i].price,
            flavour: $scope.Beer[i].flavour,
            id: $scope.Beer[i]._id,
            imgUrl: "http://localhost:4000" + $scope.Beer[i].Image

        };
        var imgUrl = "http://localhost:4000" + $scope.Beer[i].Image;
        console.log("formBody==============", formBody);


        $scope.beers.push(formBody);
    }

    console.log("$scope.beers === ", $scope.beers);

})

$scope.postForm = function() {
    var admindata = this.admin;


    console.log("admindata.emailId : ", admindata.emailId);
    console.log("admindata.role : ",admindata.role);
    
    console.log("inside postForm() admindata", admindata);
    console.log("inside postForm()");
         
         if(admindata ==undefined || (admindata.password==null || admindata.password==undefined || admindata.password=='') &&(admindata.userId==null || admindata.userId==undefined || admindata.userId=='')){
    Notification.error('emailId and password required');
    }
    else if(admindata.emailId==null || admindata.emailId==undefined || admindata.emailId==''){
    Notification.error('emailId required');
 }
    else if(admindata.password==null || admindata.password==undefined || admindata.password==''){
    Notification.error('password required');
    }
    else{
        console.log("inside else======");
    var encodedString = 'emailId=' + encodeURIComponent(admindata.emailId) +'&password=' + encodeURIComponent(admindata.password);
        console.log("encodedString======", encodedString);
    $http.post('/login', admindata).success(function(data, status, headers, config) {
            console.log("inside post======");
           
           if (data.message == "NO_EMAIL"){
               
              Notification.error('You are not Registered user with this email');
           }else if (data.message == "WRONG_PASS"){
               
              Notification.error('Wrong Password');
           }else{
           var consoledata = data.token;
           console.log("consolidata", consoledata);
            $window.localStorage.token = consoledata;
           if(!consoledata){
                //alert("You are not authorised user");
                Notification.error('You are not Registered user');
                //window.location.href = '/admin';
            }
            var encodedProfile = consoledata.split('.')[1];
            
            var profile = JSON.parse(url_base64_decode(encodedProfile));
            console.log("profile", profile);
                if (profile.userCategory == "admin"){
                    Notification.success('Admin Login Success');
                    window.location.href = '/Admin';
                    
                }
              
        }
            })
            
            
        }
        
    }

})