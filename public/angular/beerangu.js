var app = angular.module('BeerApp', ['config', 'ngCookies', 'ui-notification'])

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
var address = config_module._invokeQueue[0][2][1].LOGIN_URL;
var baseAddress = config_module._invokeQueue[0][2][1].BASE_URL;



var url = "";

app.factory('beerFactory', function ($http, $window) {

    return {
      
        getUserDetails: function (emailId) {
            console.log("id of the user === ", emailId);
            url = config_module._invokeQueue[0][2][1].BASE_URL + "GetUserDetails/" + emailId;
            console.log("url=======", url)
            return $http.get(url);
        },
        addCurrentBeer: function (beer) {
            url = config_module._invokeQueue[0][2][1].BASE_URL + "EnterOne/";
            return $http.post(url, beer);
        },
        getBeerList: function () {
            urll = config_module._invokeQueue[0][2][1].LOGIN_URL + "GetBeers";
            return $http.get(urll);
        },

        editBeerPost: function (id) {
            console.log(id);
            url = config_module._invokeQueue[0][2][1].BASE_URL + "GetBeerDetails/" + id;
            return $http.get(url);
        },

        deleteBeerPost: function (_id) {
            url = config_module._invokeQueue[0][2][1].BASE_URL + "DeleteBeerPost/" + _id;
            return $http.delete(url);
        }


    }


})



app.controller('BeerController', function ($scope, $http, beerFactory, $window, $cookies, $cookieStore, $location, Notification) {



    $scope.category = "User";
    var emailId = $window.localStorage['emailId'];
    $scope.rst = {
        name: emailId
    };
    $scope.inputType = 'password';
    $scope.Image = 'Image';
    $scope.push = null;


    var consoledata = $window.localStorage.token;
    console.log("consoledata profile", consoledata);
    if (consoledata != undefined) {
        var encodedProfile = consoledata.split('.')[1];
        var profile = JSON.parse(url_base64_decode(encodedProfile));
        $scope.profile = profile;
        console.log("Inside controller profile", profile);
    }

    // get admin profile
    $scope.getAdmin = function () {

        $scope.adminDetails = [];
        beerFactory.getUserDetails(profile.emailId).success(function (data) {
            var imgUrl = "http://localhost:4000" + data.Image;
            console.log("imgUrl==============", imgUrl);
            $scope.adminDetails = data;
            console.log("$scope.adminDetails", $scope.adminDetails);
        })

    }

    $scope.getAdmin();

    // ADD BEER

    $scope.addBeer = function () {
        var currentbeer = this.beer;

        console.log("currentbeer", currentbeer);
        if (currentbeer.name != null && currentbeer.category != null) {

            beerFactory.addCurrentBeer(currentbeer).success(function (data) {

                if (data == 'ER_DUP_ENTRY') {
                    Notification.error({
                        message: currentbeer.name + ' ' + 'Already Entered ',
                        delay: null
                    });
                } else {

                    $scope.addMode = false;
                    currentbeer = data;


                    Notification.success({
                        message: currentbeer.firstName + ' ' + ', Beer Created Successfully ',
                        delay: 1000
                    });

                    //reset form
                    $scope.beer = null;
                    window.location.href = "/Admin";

                    //$window.location.reload();


                }
            }).error(function (data) {

                Notification.error({
                    message: currentbeer.name + ' ' + ',Beer Adding Failed ',
                    delay: 1000
                });
                //$scope.error = "An Error has occured while Adding userProfile! " + data.ExceptionMessage;
            });
        }
    };


    // DISPLAY ALL BEERS



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
                Image: $scope.Beer[i].Image

            };
            var imgUrl = "http://localhost:4000" + $scope.Beer[i].Image;
            console.log("imgUrl==============", imgUrl);


            $scope.beers.push(formBody);
        }

        console.log("$scope.beers === ", $scope.beers);

    })


    // UPDATE IMAGE OF EACH BEER

    $scope.editBeer = function (id) {
        var currentBeerid = id;
        console.log("currentBeerid===", currentBeerid);
        beerFactory.editBeerPost(currentBeerid).success(function (data) {
            $scope.currentbeer = data;
            console.log("$scope.currentbeer ==== ", $scope.currentbeer)
            //$rootScope.myPost=currentPostid;


        })

    }


    // sendtodelete Beer

    $scope.sendToDeleteBeer = function (id,name) {
        $scope.beerId = id;
        $scope.beerName = name;
        console.log("beerId==", $scope.beerId);
        console.log("beerName==", $scope.beerName);
    };

    // DELETE BEER

    $scope.deleteBeer = function (beerId) {


        beerFactory.deleteBeerPost(beerId).success(function (data) {

            // delete the beer with notificaiton appearing on the screen

            if (data == 'DELETED') {
                Notification.success({
                    message: 'Beer deleted ',
                    delay: null
                });
                //Notification.success('Beer deleted');
            }
            $window.location.reload();
        }).error(function (data) {
            Notification.error({
                message: ' Beer Delete Failed ',
                delay: 1000
            });

            $('#myDeleteModal').modal('hide');
        });


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