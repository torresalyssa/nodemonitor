app.controller("updateController", function ($scope, $rootScope, $log, $timeout, updateService) {

    $scope.ready = false;
    $scope.errMsg = "";
    $scope.upToDate = true;
    $scope.checked = false;
    $scope.checking = false;
    $scope.updating = false;
    $scope.checkMsg = "";
    $scope.checkOk = false;
    $scope.updateOk = false;
    $scope.updateMsg = "";
    $scope.bowerError = "";
    $scope.npmError = "";


    $log.info("git project path is " + $rootScope.project_path);

    if (!$rootScope.project_path) {
        $scope.errMsg = "Oops! It looks like you don't have your project installed. "
            + "Go to the Install page to clone your project."
    }

    else {
        $scope.projectPath = $rootScope.project_path;
        $scope.ready = true;
    }

    $scope.$on('NOT_UP_TO_DATE', function () {
        $timeout(function() {
            $scope.checking = false;
            $scope.upToDate = false;
            $scope.checked = true;
        });
    });

    $scope.$on('UP_TO_DATE', function () {
        $scope.upToDate = true;
        $timeout(function () {
            $scope.checkOk = true;
            $scope.checkMsg = 'Everything is up-to-date!'
        });
        $scope.checking = false;
        $scope.checked = true;
    });

    $scope.$on("UPDATING", function() {
        $timeout(function() {
            $scope.checkMsg = "";
            $scope.updating = true;
        });
    });

    $scope.checkUpToDate = function () {

        var local, remote, cmd;

        $scope.upToDate = true;
        $scope.checked = false;
        $scope.updating = false;
        $scope.checkMsg = "";
        $scope.updateMsg = "";
        $scope.bowerError = "";
        $scope.npmError = "";
        $scope.numUpdates = 0;
        $scope.checking = true;
        $log.info("Checking " + $scope.projectPath);

        cmd = 'cd \"' + $scope.projectPath + "\" && git fetch";
        $log.info(cmd);
        exec(cmd, function (error) {

            if (error != null) {
                $timeout(function() {
                    $scope.checkOk = false;
                    $scope.checkMsg = 'Error checking for updates. Check Help page.';
                    $scope.checking = false;
                    $log.error('ERROR in exec (git fetch): ' + error);
                });
            }

            else {
                cmd = 'cd \"' + $scope.projectPath + '\" && git rev-parse @';
                $log.info(cmd);
                exec(cmd, function (error, stdout) {

                    if (error != null) {
                        $log.error('ERROR in exec (git rev-parse @): ' + error);
                    }

                    else {
                        local = stdout;

                        cmd = 'cd \"' + $scope.projectPath + '\" && git rev-parse @{u}';
                        $log.info(cmd);
                        exec(cmd, function (error, stdout) {

                            if (error != null) {
                                $log.error('ERROR in exec (git rev-parse @{u}): ' + error);
                            }
                            else {
                                remote = stdout;

                                if (local != remote) {
                                    $log.info('Repo is not up-to-date');
                                    $scope.$broadcast('NOT_UP_TO_DATE');
                                }
                                else {
                                    $log.info('Repo is up-to-date');
                                    $scope.$broadcast('UP_TO_DATE');
                                }
                            }
                        })
                    }
                })
            }
        });
    };


    $scope.updateRepo = function () {

        var cmd;

        $log.info("Updating " + $scope.projectPath);
        $scope.$broadcast("UPDATING");

        cmd = 'cd \"' + $scope.projectPath + '\" && git pull origin master';
        $log.info(cmd);
        exec(cmd, function (error) {

            if (error != null) {
                $log.error('ERROR in exec (git pull): ' + error);
            }
            else {
                updateService.bowerAndNpmUpdate($scope.projectPath)
                    .then(function() {
                        $timeout(function() {
                            $scope.updating = false;
                            $scope.updateOk = true;
                            $scope.updateMsg = "All done!";
                            $scope.upToDate = true;
                        });
                    }, function(err) {
                        $log.error("Error doing npm/bower updates: " + err);
                        $timeout(function() {
                            $scope.updating = false;
                            $scope.updateOk = false;
                            $scope.updateMsg = "Error doing bower/npm updates.";
                            $scope.upToDate = false;
                        });
                    })
            }
        });
    };

});