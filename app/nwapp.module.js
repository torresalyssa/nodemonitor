var app = angular.module('nwApp', ['ngRoute', 'ui.bootstrap', 'chart.js']);

app.run(function ($rootScope) {

    var slash = (process.platform === "win32") ? "\\" : "/";  // check if windows - windows will
                                                              // give 'win32' even if it is 64-bit

    json.readFile("./config.json", function(err, obj) {

        if (err) {
            $log.error("Error reading config.json.");
        }

        else {
            $rootScope.ping_endpt = obj.ping_endpt;
            $rootScope.project_name = obj.project_name;
            $rootScope.pm2_endpt = obj.pm2_endpt;
            $rootScope.project_path = obj.project_path;
            $rootScope.project_path += $rootScope.project_path.slice(-1) == slash ? '' : slash;
            $rootScope.main_project_file = obj.main_project_file;
        }
    });

});
