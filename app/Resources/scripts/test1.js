/**
 * Created by Jesse on 10-6-2015.
 */
var app = angular.module('app',['ngSanitize', 'ngRoute', 'ui.sortable']);


$( document ).ready(function() {
});

/* this service makes communication between controllers possible*/
app.factory('sharedService', function($rootScope, $q, $http) {
    var sharedService = {};

    sharedService.songQueue = [];
    sharedService.songToQueue = {};
    sharedService.playlists = [];

    /*---- broadcasting commands to other controllers ----*/
    sharedService.broadcast = function(message) {
        this.broadcastItem(message);
    };

    /* broadcast a message to all controllers */
    sharedService.broadcastItem = function(message) {
        $rootScope.$broadcast(message);
    };
    /*/////////////////////////////////////////////////////*/

    sharedService.getPlaylists =  function(){
        var response = $http.get("app/user/getPlaylists");

        response.success(function (data, status, headers, config) {
            if(data['playlists'] !== undefined && data['success']){
                sharedService.playlists = data['playlists'];
            }
        });

        response.error(function (data, status, headers, config) {
            alert("Connection to server failed!");
        });
    };
    sharedService.getPlaylists();

    sharedService.setSongQueue =  function(data){
        sharedService.songQueue = data;
        /* broadcast 'queue' to notify other controllers*/
        this.broadcast('queue');
    };

    /* set item to be added to Queue*/
    sharedService.addToQueue = function (song){
        sharedService.songToQueue = song;
        /* broadcast 'addToQueue' to notify other controllers*/
        this.broadcast('addToQueue');
    };

    /* set item to be added to Queue and played */
    sharedService.playSong = function (song){
        sharedService.songToQueue = song;
        /* broadcast 'playSong' to notify other controllers*/
        this.broadcast('playSong');
    };

    sharedService.removeSong = function (id){
        var deferred = $q.defer();

        var response = $http.get("app/removeAudio/" + id);

        response.success(function (data, status, headers, config) {
            if(data['success']){
                deferred.resolve(data['success']);
                alert("Song removed");
            } else {
                deferred.resolve(false);
                alert("Could not be removed");
            }
        });

        response.error(function (data, status, headers, config) {
            deferred.resolve(false);
            alert("Connection to server failed!");
        });

        return deferred.promise;
    };

    sharedService.addToList = function(listId, songId){
        var deferred = $q.defer();

        var response = $http.get("app/addToPlaylist/"+ listId +"/" + songId);

        response.success(function (data, status, headers, config) {
            if(data['success']){
                alert("Added to playlist");
            } else if(data['reason'] == 'duplicate') {
                alert('The playlist already contains this item');
            }
        });

        response.error(function (data, status, headers, config) {
            alert("Connection to server failed!");
        });

        return deferred.promise;
    };

    return sharedService;
});

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
        .when('/playlists/:playlistId/:playlistName', {
            templateUrl : 'app/getPlaylistView',
            controller  : 'playlistController'
        })
        .when('/albums', {
            templateUrl : 'app/getAlbumsView',
            controller  : 'albumsController'
        })
        .when('/albums/:albumId/:albumName', {
            templateUrl : 'app/getAlbumView',
            controller  : 'albumController'
        });

});

// create the controller and inject Angular's $scope
app.controller('uploadController', function($scope) {
});

app.controller('uploadsController', function($scope, $http, $timeout, $routeParams, sharedService) {
    $scope.functions = {};
    $scope.playlists = [];

    $scope.functions.loadUploadsView = function (item, event) {
        var response = $http.get("app/user/getUploads");

        response.success(function (data, status, headers, config) {
            if(data['playlist'] !== undefined && data['success']){
                $scope.songs = data['playlist']['listItems'];
                $scope.playlists = sharedService.playlists;
            }

            /* make the table scrollable, after the $digest cycle otherwise the dimensions won't be accurate*/
            $timeout(function() {
                $('#uploadsView table').scrollTableBody();
            });
        });

        response.error(function (data, status, headers, config) {
            alert("AJAX failed!");
        });

    };

    $scope.functions.loadUploadsView();

    /* function to remove item */
    $scope.functions.removeItem = function (id, index) {
        /* use the method from the service to do this */
        sharedService.removeSong(id).then( function(success) {
            if(success){
                $scope.functions.removeItemFromData(index);
            } else {
                /* do nothing */
            }
        });
    };

    $scope.functions.removeItemFromData = function (index) {
        $scope.songs.splice(index, 1);
    };

    $scope.functions.addToList = function (listId, songId) {
        sharedService.addToList(listId, songId).then( function () {
            /* nothing */
        });
    };

    $scope.functions.addToQueue = function (song){
        sharedService.addToQueue(song);
    };

    $scope.functions.playSong = function (song){
        sharedService.playSong(song);
    };

});

app.controller('registrationController', function($scope) {
});

app.controller('playlistsController', function($scope, $http) {

    $scope.functions = {};

    $scope.functions.loadPlaylistsView = function (item, event) {
        var response = $http.get("app/user/getPlaylists");

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

app.controller('playlistController', function($scope, $http, $routeParams, $timeout, sharedService) {
    $scope.functions = {};
    $scope.playlists = [];

    $scope.functions.loadPlaylistView = function (item, event) {
        var response = $http.get("app/user/getPlaylistResults/" + $routeParams.playlistId);

        response.success(function (data, status, headers, config) {
            if(data['playlist'] !== undefined && data['success']){
                $scope.songs = data['playlist']['listItems'];
                $scope.playlists = sharedService.playlists;
            }


            /* make the table scrollable, after the $digest cycle otherwise the dimensions won't be accurate*/
            $timeout(function() {
                $('#playlistView table').scrollTableBody();
            });
        });

        response.error(function (data, status, headers, config) {
            alert("AJAX failed!");
        });

    };

    $scope.functions.loadPlaylistView();

    /* calling the sharedService functions*/
    $scope.functions.playPlaylist = function() {
        sharedService.setSongQueue($scope.songs);
    };

    $scope.functions.addToQueue = function (song){
        sharedService.addToQueue(song);
    };

    $scope.functions.playSong = function (song){
        sharedService.playSong(song);
    };

    $scope.functions.addToList = function (listId, songId){
        sharedService.addToList(listId, songId).then( function(){
           /* nothing */
        });
    };

});

app.controller('albumsController', function($scope, $http) {

    $scope.functions = {};

    $scope.functions.loadAlbumsView = function (item, event) {
        var response = $http.get("app/user/getAlbums");

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
        var response = $http.get("app/user/getAlbumResults/" + $routeParams.albumId);

        response.success(function (data, status, headers, config) {
            if(data['album'] !== undefined && data['success']){
                $scope.songs = data['album']['listItems'];
            }
        });

        response.error(function (data, status, headers, config) {
            alert("AJAX failed!");
        });

    };

    $scope.functions.loadPlaylistView();

});


/* Code for the footer */

app.controller('footerController', function($scope, $http, $routeParams,$timeout,$q, sharedService) {
    $scope.functions = {};
    $scope.songQueue = [];
    $scope.selected = {};
    $scope.index = 0;
    $scope.indexHighLighted = 0;
    var player;

    $scope.functions.loadQueue = function (item, event) {
    };
    $scope.functions.loadQueue();

    /* When the service broadcasts 'queue'*/
    $scope.$on('queue', function() {
        $scope.songQueue = angular.copy(sharedService.songQueue);
        // no items in the array abort
        if(! $scope.songQueue.length > 0 ) {
            return;
        }
        /* set selected to the first item in the songQueque)*/
        $scope.selected = $scope.songQueue[$scope.index];

        // set the new source for the player, timeout to make sure all the changes are digested
        $timeout(function() {
            player.setSrc($scope.selected.fullPath);
            player.play();
        });

    });

    /* When the service broadcasts 'addToQueue'*/
    $scope.$on('addToQueue', function() {

        $scope.songQueue.push( angular.copy(sharedService.songToQueue) );

        /* if there is only one item we start playing this */
        if($scope.songQueue.length === 1 ) {
            $scope.selected = $scope.songQueue[0];
            $timeout(function() {
                player.setSrc($scope.selected.fullPath);
                player.play();
            });
        }
    });

    /* When the service broadcasts 'playSong'*/
    $scope.$on('playSong', function() {

        /* when the queue is not empty*/
        if($scope.songQueue.length > 0) {
            $scope.songQueue.splice($scope.index, 0, angular.copy(sharedService.songToQueue) );
            $scope.selected = $scope.songQueue[$scope.index];
        }
        /* when the queue is empty*/
        else {
            $scope.songQueue.push( angular.copy(sharedService.songToQueue) );
            $scope.selected = $scope.songQueue[0];
        }

        /* start to play the song*/
        $timeout(function() {
            player.setSrc($scope.selected.fullPath);
            player.play();
        });

    });

    $scope.functions.nextSong = function (item, event) {

        var deferred = $q.defer();

        /* check we are at the end of the list yet, if true reset the index */
        if(($scope.index + 1) == $scope.songQueue.length){
            $scope.index = 0;
        } else {
            $scope.index++;
        }

        // set selected to the first item of the future, remove item from future
        $scope.selected = $scope.songQueue[$scope.index];

        // set the new source for the player, timeout to make sure all the changes are digested
        $timeout(function() {
            player.setSrc($scope.selected.fullPath);
            player.play();
        });

        deferred.resolve();

        return deferred.promise;
    };

    $scope.functions.playSong = function (songIndex) {

        if((songIndex + 1) > $scope.songQueue.length) {
            return;
        }

        $scope.index = songIndex;
        $scope.selected = $scope.songQueue[$scope.index];

        // set the new source for the player, timeout to make sure all the changes are digested
        $timeout(function() {
            player.setSrc($scope.selected.fullPath);
            player.play();
        });

    };

    /* function that builds the mediaplayer */
    $scope.functions.buildMediaPlayer = function () {

            player = new MediaElementPlayer('#audioPLayer', {
                defaultVideoWidth: 200,
                defaultVideoHeight: 50,
                features: ['playpause', 'progress', 'current', 'duration', 'volume', 'fullscreen'],
                success: function (mediaElement, domObject) {

                    mediaElement.addEventListener('ended', function (e) {
                        setTimeout(function () {
                            $scope.functions.nextSong();
                        }, 500);
                    }, false);

                }
            });

            player.pause();
            return player;

    };

    /* build the player, timeout to make sure all the models are digested
     * this is a hack, the intention is to wait until the end of the $digest cycle and then call the function
     * this works because Timeouts are called after all watches are done.
     */
    $timeout(function(){
        $scope.functions.buildMediaPlayer();
    });

    $scope.functions.songClicked = function (songIndex) {
        /* check if the item was just dragged, in that case we dont want to play it */
        if($scope.justDragged === songIndex) {
            /* reset this value, so next time this item is clicked it will play */
            $scope.justDragged = 99999;
            return;
        }
        /* is this song already highlighted? */
        if($scope.indexHighLighted === songIndex && $scope.highLightedThisClick === false) {
            /* is this song not already playing? */
            if($scope.index !== songIndex) {
                $scope.functions.playSong(songIndex);
            }
        }


/*        else {
            $scope.indexHighLighted = songIndex;
        }*/

    };

    $scope.functions.songMouseDown = function (songIndex) {

        /* is this song already highlighted? */
        if($scope.indexHighLighted === songIndex) {
            /* since we use botch ng-click and ng-mousedown, we use this variable
            *  to tell if this item was just highlighted in the same click action
            *  because if thats true we don't want to play it yet
            */
            $scope.highLightedThisClick = false
        } else {
            $scope.indexHighLighted = songIndex;
            $scope.highLightedThisClick = true;
        }
    };

    /* function that removes an item from the queue based on its index */
    $scope.functions.removeFromQueue = function(songIndex) {
        /* check if song is being played*/
        if($scope.index === songIndex) {
            /* check if its not the only item */
            if($scope.songQueue.length > 1) {
                /* remove the item*/
                $scope.songQueue.splice(songIndex, 1);
                /* set index one lower since the array has become one smaller*/
                $scope.index--;
                /* call the function that will run the next song (so index + 1)*/
                $scope.functions.nextSong().then( function() {
                    $timeout(function() {
                        /* set the highlight on the now playing item */
                        $scope.indexHighLighted = $scope.index;
                    });
                });
            } else {
                $scope.functions.emptyQueue();
            }
        } else {
            /* if last item select first item */
            if(songIndex + 1 == $scope.songQueue.length ) {
                $scope.indexHighLighted = 0;
            }

            $scope.songQueue.splice(songIndex, 1);
            /* the item we remove is before the current playing item
            *  we have to move the index of the playing item one down
            * */
            if(songIndex < $scope.index) {
                $scope.index--
            }
        }
    };

    $scope.functions.emptyQueue = function() {
        /* make everything empty */
        $scope.songQueue = [];
        $scope.selected = {};
        $scope.index = 0;
        $scope.indexHighLighted = 0;

        /* remove the source from the player */
        /* TODO more is needed to reset the players progress bar, maybe an empty mp3 file? */
        /*player.stop();*/
        player.pause();
        player.setSrc("");
    };

    /* these variables are used to keep track
    * if the dragged item is being played
    * if the item was just dragged (we dont want it to start play in that case)
    * */

    $scope.oldIndex = 0;
    $scope.justDragged = 99999;
    /* options for the draggable items in the songQueue*/
    $scope.sortableOptions = {
        start: function(e, ui) {
            /* remember the old index */
            $scope.oldIndex = ui.item.sortable.index;

        },
        stop: function(e, ui) {

            /* check if the item is playing
             * also works if the item started playing mid drag
             * */
            if($scope.index == $scope.oldIndex) {
                $scope.index = ui.item.index();
            }

            /* check if the index needs to be changed based on the position*/
            if ( $scope.index !== ui.item.index() ){
                if(ui.item.index() > $scope.index && $scope.oldIndex < $scope.index && $scope.index !== 0) {
                    $scope.index--;
                } else if (ui.item.index() < $scope.index && $scope.oldIndex > $scope.index) {
                    $scope.index++;
                }
            }

            /* we highlight the item on its new position */
            $scope.indexHighLighted = ui.item.index();

            /* this var now tells that the item was just dragged */
            $scope.justDragged = ui.item.index();

            /* reset this value*/
            $scope.isPLaying = false;
        }

    };

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


