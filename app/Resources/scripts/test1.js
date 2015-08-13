/**
 * Created by Jesse on 10-6-2015.
 */
var app = angular.module('app',['ngSanitize', 'ngRoute']);

/* this code initializes some values */
/*
$scope.init = function () {
    if ($routeParams.Id) {
        //get an existing object
    } else {
        //create a new object
    }
    $scope.isSaving = false;
}

$scope.init();
*/


app.controller('initialisationController', ['$scope', function($scope) {
    $scope.functions = {};
}]);

/* routing */
app.config(function($routeProvider) {
    $routeProvider

        // uploadForm
        .when('/', {
            templateUrl : 'app/empty',
            controller  : ''
        })
        .when('/upload', {
            templateUrl : 'app/getUploadForm',
            controller  : 'uploadController'
        })
        .when('/uploads', {
            templateUrl : 'app/getUploadsView',
            controller  : 'uploadsController'
        })
        .when('/registration', {
            templateUrl : 'app/getRegistrationForm',
            controller  : 'registrationController'
        })
        .when('/playlists', {
            templateUrl : 'app/getPlaylistsView',
            controller  : 'playlistsController'
        })
        .when('/playlists/:playlistName', {
            templateUrl : 'app/getPlaylistView',
            controller  : 'playlistController'
        })
        .when('/albums', {
            templateUrl : 'app/getAlbumsView',
            controller  : 'albumsController'
        })
        .when('/albums/:albumName', {
            templateUrl : 'app/getAlbumView',
            controller  : 'albumController'
        });

});

// create the controller and inject Angular's $scope
app.controller('uploadController', function($scope) {
});

app.controller('uploadsController', function($scope, $http, $routeParams) {
    $scope.functions = {};

    $scope.functions.loadUploadsView = function (item, event) {
        var response = $http.get("app/getUploads");

        response.success(function (data, status, headers, config) {
            if(data['uploads'] !== undefined && data['success']){
                $scope.songs = data['uploads']['listItems'];

                if(data['playlists'] !== undefined){
                    $scope.playlists = data['playlists'];
                }
            }
        });

        response.error(function (data, status, headers, config) {
            alert("AJAX failed!");
        });

    };

    $scope.functions.loadUploadsView();

    $scope.functions.removeItem = function (id, index) {

         var response = $http.get("app/removeAudio/" + id);

         response.success(function (data, status, headers, config) {
             if(data['success']){
                alert("Upload removed");
                $scope.functions.removeItemFromData(index);
             }
         });

         response.error(function (data, status, headers, config) {
            alert("AJAX failed!");
         });

    };

    $scope.functions.removeItemFromData = function (index) {
        $scope.songs.splice(index, 1);
    };

    $scope.functions.addToList = function (listId, songId) {

        var response = $http.get("app/addToPlaylist/"+ listId +"/" + songId);

        response.success(function (data, status, headers, config) {
            if(data['success']){
                alert("Added to playlist");
            }
        });

        response.error(function (data, status, headers, config) {
            alert("AJAX failed!");
        });

    };

});

app.controller('registrationController', function($scope) {
});

app.controller('playlistsController', function($scope, $http) {

    $scope.functions = {};

    $scope.functions.loadPlaylistsView = function (item, event) {
        var response = $http.get("app/getPlaylists");

        response.success(function (data, status, headers, config) {
            if(data['playlists'] !== undefined && data['success']){
                $scope.playlists = data['playlists'];
            }
        });

        response.error(function (data, status, headers, config) {
            alert("AJAX failed!");
        });

    };

    $scope.functions.loadPlaylistsView();

});

app.controller('playlistController', function($scope, $http, $routeParams) {
    $scope.functions = {};

    $scope.functions.loadPlaylistView = function (item, event) {
        var response = $http.get("app/getPlaylist/" + $routeParams.playlistName);

        response.success(function (data, status, headers, config) {
            if(data['playlist'] !== undefined && data['success']){
                $scope.songs = data['playlist']['listItems'];
            }
        });

        response.error(function (data, status, headers, config) {
            alert("AJAX failed!");
        });

    };

    $scope.functions.loadPlaylistView();
});

app.controller('albumsController', function($scope, $http) {

    $scope.functions = {};

    $scope.functions.loadAlbumsView = function (item, event) {
        var response = $http.get("app/getAlbums");

        response.success(function (data, status, headers, config) {
            if(data['albums'] !== undefined && data['success']){
                $scope.albums = data['albums'];
            }
        });

        response.error(function (data, status, headers, config) {
            alert("AJAX failed!");
        });

    };

    $scope.functions.loadAlbumsView();

});

app.controller('albumController', function($scope, $http, $routeParams) {
    $scope.functions = {};

    $scope.functions.loadPlaylistView = function (item, event) {
        var response = $http.get("app/getAlbum/" + $routeParams.albumName);

        response.success(function (data, status, headers, config) {
            if(data['album'] !== undefined && data['success']){
                $scope.songs = data['album']['tracks'];
            }
        });

        response.error(function (data, status, headers, config) {
            alert("AJAX failed!");
        });

    };

    $scope.functions.loadPlaylistView();

});








/*function initializeFileInput() {
    $(function () {
        $('#fileInput').fileupload({
            dataType: 'json',
            done: function (e, data) {
                $.each(data.result.files, function (index, file) {
                    $('<p/>').text(file.name).appendTo(document.body);
                });
            }
        });
    });
}*/





/*

angular.module('bindHtmlExample', ['ngSanitize'])
    .controller('ExampleController', ['$scope', function($scope) {
        $scope.myHTML =
            'I am an <code>HTML</code>string with ' +
            '<a href="#">links!</a> and other <em>stuff</em>';
    }]);
*/

/* QUEING AJAX CALLS*/
/*adding new function called loadPlaylistView to the 'functions' object*/
/* $scope.functions.loadPlaylistView = function (item, event) {
 *//*JSON call*//*
 *//*            var response = $http.get("app/getPlaylistView");
 response.success(function (data, status, headers, config) {
 $('#pageCenter').html(data);
 });
 response.error(function (data, status, headers, config) {
 alert("AJAX failed!");
 });*//*
 // this way we can que multiple ajax calls, and give them the same callback
 $q.all({
 view: $http.get('app/getPlaylistView')
 .error(function (data, status, headers, config) {
 alert("AJAX failed!");
 })
 ,
 data: $http.get('app/getPlaylists')
 .error(function (data, status, headers, config) {
 alert("AJAX failed!");
 })
 }).then(function(results) {
 var view = results.view.data;
 var data = results.data.data;

 $('#pageCenter').html(view);

 var playlists = data['playlists'];

 if(playlists !== undefined && data['success']){
 renderPlaylistData(playlists);
 }
 });
 };*/

/* DIRECTIVE */
/* all real dom manipulation should be done in directives*/
/* we can see some dependency injection going on, of the $q service*/
/*app.directive('leftMenuDirective', function($q) {

    // we link onclick
    var linkFn = function ($scope, $http) {

        *//*creating a new object called functions*//*
        $scope.functions = {};

        *//*adding new function called loadUploadPage to the 'functions' object*//*
        $scope.functions.loadUploadPage = function (item, event) {
            *//*JSON call*//*
            var response = $http.get("app/getUploadForm");
            response.success(function (data, status, headers, config) {
                $('#pageCenter').html(data);
            });
            response.error(function (data, status, headers, config) {
                alert("AJAX failed!");
            });
        };

        *//*adding new function called loadListenPage to the 'functions' object*//*
        $scope.functions.loadListenPage = function (item, event) {
            $('#pageCenter').html('<h1>Listenpage</h1>');
        };

        *//*adding new function called loadAddUserForm to the 'functions' object*//*
        $scope.functions.loadAddUserForm = function (item, event) {
            *//*JSON call*//*
            var response = $http.get("app/getRegistrationForm");
            response.success(function (data, status, headers, config) {
                $('#pageCenter').html(data);
            });
            response.error(function (data, status, headers, config) {
                alert("AJAX failed!");
            });
        };



    };

    return {
        *//*'A' can be used if we use the directive as an attribute*//*
        restrict: 'E',
        controller: linkFn
    };
});*/


