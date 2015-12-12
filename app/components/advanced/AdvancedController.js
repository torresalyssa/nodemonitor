app.controller("advancedController", function ($scope, $rootScope, $log, $http, $interval,
                                               $q, $timeout, $modal) {

    var check = undefined;
    var checkFrequency = 5000;

    $scope.ready = false;
    $scope.errMsg = "";

    $scope.app = {
        "running": false,
        "name": $rootScope.project_name,
        "processing": false
    };

    $scope.pm2 = {
        "running": false,
        "processing": false
    };

    $scope.procs = [];

    $scope.data = undefined;

    $scope.getPMStatus = function() {

        return $http.get($rootScope.pm2_endpt)

            .then(function(data) {
                $scope.pm2.running = true;
                $scope.data = data.data;
                $scope.procs = data.data.processes;
                $scope.$broadcast("PM2_RUNNING");
            })

            .catch(function(err) {
                $log.error("Unable to get monitoring info: " + err);
                $scope.pm2.running = false;
                $scope.data = undefined;
                $scope.procs = [];
            });
    };

    $scope.getAppStatus = function() {

        return $http.get($rootScope.ping_endpt)

            .then(function(data) {
                $scope.app.running = true;
                $log.info(data);
                $scope.$broadcast("APP_RUNNING");
            })

            .catch(function() {
                $scope.app.running = false;
            });
    };


    $scope.$on("PM2_RUNNING", function() {
        $scope.pm2.processing = false;
    });

    $scope.$on("APP_RUNNING", function() {
        $scope.app.processing = false;
    });

    $scope.$on("PROC_RUNNING", function(event, args) {

    });


    $scope.pm2Start = function() {
        $scope.pm2.processing = true;

        $log.info('Running: pm2 web');

        exec('pm2 web', function(error) {

            if (error)
                $log.error("Exec error in pm2 web: " + error);
            else
                checkAllStatus();
        });
    };


    $scope.appStart = function() {
        $scope.app.processing = true;

        var cmd = "cd \"" + $rootScope.project_path + "\" && pm2 start "
            + $rootScope.main_project_file;

        exec(cmd, function(error) {

            if (error)
                $log.error("Error in appStart: " + error);
            else
                checkAllStatus();
        });
    };


    function runProcCmd(proc, c, delay) {
        var cmd = c + " " + proc.name;

        stopCheck();
        proc.processing = true;

        $log.info("Running: " + cmd);
        exec(cmd, function(error) {

            if (error) {
                $log.error("Exec error: " + error);
                proc.processing = false;
            }

            else {
                $timeout(function() {
                    checkAllStatus()
                        .then(function () {
                            proc.processing = false;
                            startCheck();
                        })
                        .catch(function () {
                            $log.error("Error checking status");
                            proc.processing = false;
                            startCheck();
                        })
                }, delay);
            }
        })
    }


    $scope.start = function(proc) {
        runProcCmd(proc, "pm2 start", 1000);
    };

    $scope.stop = function(proc) {
        runProcCmd(proc, "pm2 stop", 0);
    };

    $scope.restart = function(proc) {
        runProcCmd(proc, "pm2 restart", 5000);
    };


    $scope.delete = function(proc) {
        runProcCmd(proc, "pm2 delete");
    };


    function checkAllStatus() {
        return $q.all([$scope.getPMStatus(), $scope.getAppStatus()]);
    }

    function stopCheck() {
        if (check)
            $interval.cancel(check);
    }

    function startCheck() {
        check = $interval(checkAllStatus, checkFrequency);
    }

    $scope.open = function(proc) {
        $scope.curProc = proc;

        var modal = $modal.open({
            templateUrl: 'app/components/advanced/modal.html',
            size: 'lg',
            controller: "advModalController",
            scope: $scope
        });

    };

    if (!$rootScope.project_path) {  // check if project is installed
        $scope.errMsg = "Oops! It looks like you don't have your project installed. "
            + "Go to the Install page to clone your project."
    }
    else {
        exec("pm2 -v", function (error) {  // check if PM2 is installed

            if (error) {
                $scope.errMsg = "Oops! It looks like you don't have PM2 installed. "
                    + "Go to the Install page to install PM2.";
            }
            else {
                checkAllStatus()
                    .then(function() {
                        $scope.ready = true;
                    });
                startCheck();
            }

        });
    }

    $scope.$on('$destroy', function() {
        stopCheck();
    })
});