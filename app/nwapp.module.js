var app = angular.module('nwApp', ['ngRoute']);

app.run(function ($rootScope ,$http, $log) {
    $rootScope.msg = "Monitoring Node server running PM2...";

    $rootScope.processes = [];

    $http.get("http://localhost:9615")

        .then(function(data) {
            $log.info(data.data);
            dispData(data.data);
        })

        .catch(function(err) {
            $log.error("Unable to get monitoring info: " + err);
            $rootScope.msg = "Unable to get monitoring information. "
                + "Check that your app is running with PM2 and you have run 'pm2 web' to start reporting data."
        });

    function dispData(data) {
        $rootScope.processes = data.processes;
    }
});
