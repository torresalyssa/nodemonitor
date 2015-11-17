var app = angular.module('nwApp', ['ngRoute', 'ui.bootstrap', 'chart.js']);

app.run(function ($rootScope) {

    json.readFile("./config.json", function(err, obj) {

        if (err) {
            $log.error("Error reading config.json.");
        }

        else {
            $rootScope.ping_endpt = obj.ping_endpt;
            $rootScope.pm2_endpt = obj.pm2_endpt;
            $rootScope.github_path = obj.github_path;
        }
    });

});
