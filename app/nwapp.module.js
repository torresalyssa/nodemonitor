var app = angular.module('nwApp', ['ngRoute', 'ui.bootstrap', 'chart.js',
                                   'fileDialogService', 'userdefaults.service',
                                   'update.service']);

app.run(function ($rootScope, $log, userDefaults) {

    $rootScope.configLoaded = false;
    $rootScope.configErr = false;
    $rootScope.configMsg = "Loading configuration file...";

    json.readFile("./config.json", function(err, obj) {

        if (err) {
            $log.error("Error reading config.json.");
            $rootScope.configLoaded = false;
            $rootScope.configErr = true;
            $rootScope.configMsg = "Error reading configuration file."
        }

        else {
            $rootScope.ping_endpt = obj.ping_endpt;
            $rootScope.project_name = obj.project_name;
            $rootScope.pm2_endpt = obj.pm2_endpt;
            $rootScope.project_path = obj.project_path ? obj.project_path
                                      : userDefaults.getStringForKey("project_path", "");
            $rootScope.main_project_file = obj.main_project_file;
            $rootScope.git_repo = obj.git_repo;

            $rootScope.configLoaded = true;
            $rootScope.configMsg = "Configuration file loaded!";
        }
    });

});
