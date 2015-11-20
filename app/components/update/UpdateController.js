app.controller("updateController", function ($scope, $rootScope, $log, $timeout) {

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

    $scope.numUpdates = 0;

    $scope.projectPath = $rootScope.project_path;

    $log.info("git project path is " + $scope.projectPath);

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

    $scope.$on("UPDATED", function() {
        $scope.numUpdates--;
        if ($scope.numUpdates == 0) {
            $timeout(function() {
                $scope.updating = false;
                $scope.updateOk = true;
                $scope.updateMsg = "All done!";
                $scope.upToDate = true;
            });
        }
    });

    $scope.checkUpToDate = function () {

        var local, remote;

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


        exec('cd ' + $scope.projectPath + " && git fetch", function (error) {

            if (error != null) {
                $timeout(function() {
                    $scope.checkOk = false;
                    $scope.checkMsg = 'Error checking for updates. Make sure your project has a git repository.';
                    $scope.checking = false;
                    $log.error('ERROR in exec (git fetch): ' + error);
                });
            }

            else {
                exec('cd ' + $scope.projectPath + ' && git rev-parse @', function (error, stdout) {

                    if (error != null) {
                        $log.error('ERROR in exec (git rev-parse @): ' + error);
                    }

                    else {
                        local = stdout;

                        exec('cd ' + $scope.projectPath + ' && git rev-parse @{u}', function (error, stdout) {

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

        var bowers = [];
        var npms = [];
        var i;

        $scope.numUpdates = 0;
        $log.info("Updating " + $scope.projectPath);
        $scope.$broadcast("UPDATING");

        exec('cd ' + $scope.projectPath + ' && git pull origin master', function (error) {

            if (error != null) {
                $log.error('ERROR in exec (git pull): ' + error);
            }
            else {

                // Find where we need bower updates
                var bowerStdout;
                var bowerFind = "find " + $scope.projectPath +
                    " -name 'bower.json' | grep -v node_modules | grep -v bower_components";

                try {
                    bowerStdout = execSync(bowerFind);
                }
                catch (err){
                    $log.error('ERROR in exec (find bower.json): ' + err);
                }

                bowers = bowerStdout.toString().split("\n");

                for (i = 0; i < bowers.length; i++) {
                    bowers[i] = bowers[i].replace("bower.json", "");
                    if (bowers[i] != "") {
                        $scope.numUpdates++;
                    }
                }

                //Find where we need npm updates
                var npmStdout = "";
                var npmFind = "find " + $scope.projectPath +
                    " -name 'package.json' | grep -v node_modules | grep -v bower_components";

                try {
                    npmStdout = execSync(npmFind);
                }
                catch (err) {
                    $log.error("ERROR in exec (find package.json): " + err);
                }

                npms = npmStdout.toString().split("\n");

                for (i = 0; i < npms.length; i++) {
                    npms[i] = npms[i].replace("package.json", "");
                    if (npms[i] != "") {
                        $scope.numUpdates++;
                    }
                }

                // Do bower update(s)
                for (i = 0; i < bowers.length; i++) {
                    if (bowers[i] != "") {
                        exec("cd " + bowers[i] + " && bower update", function (error, stdout) {
                            if (error != null) {
                                $log.error("ERROR in exec (bower update): " + error);
                                $timeout(function() {$scope.bowerError = "Error in bower update. Check console for more information."});
                            }
                            $scope.$broadcast('UPDATED');

                            $log.info('stdout (bower update): ' + stdout);
                        })
                    }
                }

                // Do npm update(s)
                for (i = 0; i < npms.length; i++) {
                    if (npms[i] != "") {
                        exec("cd " + npms[i] + " && npm update", function (error, stdout) {
                            if (error != null) {
                                $log.error("ERROR in exec (npm update): " + error);
                                $timeout(function() {$scope.npmError = "Error in npm update. Check console for more information."});
                            }
                            $scope.$broadcast('UPDATED');

                            $log.info('stdout (npm update): ' + stdout);
                        })
                    }
                }
            }
        });
    };

});