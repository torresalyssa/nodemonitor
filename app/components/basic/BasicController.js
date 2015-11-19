app.controller("basicController", function ($scope, $rootScope, $log, $http, $interval, $q, $timeout) {

    $scope.ready = false;

    $scope.app = {
        "running": false,
        "name": $rootScope.project_name,
        "processing": false
    };

    $scope.pm2 = {
        "running": false
    };

    var check = undefined;

    $scope.data = undefined;

    $scope.getPMStatus = function() {

        return $http.get($rootScope.pm2_endpt)

            .then(function(data) {
                $scope.pm2.running = true;
                $scope.data = data.data;
            })

            .catch(function(err) {
                $log.error("Unable to get monitoring info: " + err);
                $scope.pm2.running = false;
            });
    };

    $scope.getAppStatus = function() {

        return $http.get($rootScope.ping_endpt)

            .then(function(data) {
                $scope.app.running = true;
                $log.info(data);
            })

            .catch(function() {
                $scope.app.running = false;
            });
    };


    $scope.appStart = function() {
        $scope.app.processing = true;

        appStart()

            .then(function() {
                /* put in timeout to allow for pm2 to restart, is there a better way? */
                $timeout(function(){
                    checkAllStatus()

                        .then(function() {
                            $scope.app.processing = false;
                        })
                        .catch(function() {
                            $log.error("Error checking status");
                            $scope.app.processing = false;
                        })
                }, 2000);
            })
            .catch(function(err) {
                $log.error('Exec error in appStart: ' + err);
                $scope.app.processing = false;
            })
    };

    function appStart() {
        return $q(function(resolve, reject) {

            var cmd = 'cd ' + $rootScope.project_path + '&& pm2 start '
                      + $rootScope.main_project_file;

            $log.info('Running: ' + cmd);

            exec(cmd, function(error) {

                if (error) {
                    reject(error);
                }
                else {
                    cmd = 'pm2 web';

                    $log.info('Running: ' + cmd);

                    exec(cmd, function(error, stdout) {

                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(stdout);
                        }
                    });
                }
            });
        })
    }

    $scope.appStop = function() {
        $scope.app.processing = true;

        appStop()

            .then(function() {

                checkAllStatus()

                    .then(function() {
                        $scope.app.processing = false;
                    })
                    .catch(function() {
                        $log.error("Error checking status");
                        $scope.app.processing = false;
                    })
            })
            .catch(function(err) {
                $log.error('Exec error in appStop: ' + err);
                $scope.app.processing = false;
            })
    };

    function appStop() {

        return $q(function(resolve, reject) {

            var cmd = 'pm2 stop all';

            $log.info('Running: ' + cmd);

            exec(cmd, function(error, stdout) {

                if (error) {
                    reject(error);
                }

                else {
                    checkAllStatus()
                        .then(function() {
                            resolve(stdout);
                        })
                }
            });
        })
    }

    $scope.appRestart = function() {
        $scope.app.processing = true;

        appRestart()

            .then(function() {
                /* put in timeout to allow for pm2 to restart, is there a better way? */
                $timeout(function(){
                    checkAllStatus()

                        .then(function() {
                            $scope.app.processing = false;
                        })
                        .catch(function() {
                            $log.error("Error checking status");
                            $scope.app.processing = false;
                        })
                }, 2000);
            })
            .catch(function(err) {
                $log.error('Exec error in appRestart: ' + err);
                $scope.app.processing = false;
            })
    };

    function appRestart() {

        return $q(function(resolve, reject) {

            var cmd = 'pm2 restart all';

            $log.info('Running: ' + cmd);

            exec(cmd, function(error, stdout) {

                if (error) {
                    reject(error);
                }

                else {
                    resolve(stdout);
                }
            });
        })
    }

    function checkAllStatus() {
        return $q.all([$scope.getPMStatus(), $scope.getAppStatus()]);
    }


    checkAllStatus()
        .then(function() {
            $scope.ready = true;
        });

    /* check statuses every 10 seconds */
    check = $interval(function() {
        checkAllStatus();
    }, 10000);


    $scope.$on('$destroy', function() {
        if (check)
            $interval.cancel(check);
    })
});