app.controller("advModalController", function ($scope, $rootScope, $interval, $http, $log, $modalInstance) {

    var log_lines = 20;  /* number of lines of the out and err logs to show */

    function checkLogs() {
        fs.readFile($scope.curProc.pm2_env.pm_out_log_path, function(err, data) {
            if (err) {
                $log.error("Error getting out log from "
                           + $scope.curProc.pm2_env.pm_out_log_path + ": " + err);
            }
            else {
                var lines = data.toString("utf8").split("\n");
                $scope.outLogs = lines.slice(-log_lines);
                fs.readFile($scope.curProc.pm2_env.pm_err_log_path, function(err, data) {
                    if (err) {
                        $log.error("Error getting error log from "
                            + $scope.curProc.pm2_env.pm_err_log_path + ": " + err);
                    }
                    else {
                        var lines = data.toString("utf8").split("\n");
                        $scope.errLogs = lines.slice(-log_lines);
                    }
                })
            }
        })
    }

    checkLogs();

    var logCheck = $interval(checkLogs, 10000);

    $scope.close = function() {
        if (logCheck)
            $interval.cancel(logCheck);
        $modalInstance.close();
    };

});