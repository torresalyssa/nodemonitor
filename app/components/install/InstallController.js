app.controller("installController", function ($scope, $rootScope, $log, $timeout, $q, fileDialog) {

    var slash = (process.platform === "win32") ? "\\" : "/";  // check if windows - windows will
                                                              // give 'win32' even if it is 64-bit

    $scope.ready = false;

    $scope.pm2 = {
        "installed": undefined,
        "installing": false,
        "msg": ""
    };

    $scope.project = {
        "installed": undefined,
        "installing": false,
        "msg": ""
    };


    exec("pm2 -v", function (error) {

        if (error) {
            $scope.pm2.installed = false;
        }

        else {
            $scope.pm2.installed = true;
            $scope.pm2.msg = "PM2 is installed!";
        }

        $timeout(function() {
            $scope.ready = true;
        });
    });


    $scope.installPm2 = function() {

        $log.info("installing pm2...");

        $scope.pm2.installing = true;

        exec("npm install pm2 -g", function(error) {

            if (error) {
                $scope.pm2.msg = "Error installing PM2. Check Help page.";
                $log.error(error);
            }

            else {
                $log.info("pm2 installed!");
                $scope.pm2.msg = "PM2 is installed!";
                $scope.pm2.installed = true;
            }

            $timeout(function() {
                $scope.pm2.installing = false;
            });
        })
    };


    $scope.chooseDir = function() {

        return $q(function(res) {
            fileDialog.openDir(function(dir) {
                for (var i = 0; i < dir.length; i++) {
                    if (dir[i] == ' ') {   //TODO: check this on Windows
                        dir = dir.slice(0, i) + "\\" + dir.slice(i);
                        i++;
                    }
                }
                res(dir);
            })
        });
    };


    $scope.installProject = function() {

        $log.info("cloning project at " + $rootScope.git_repo + "...");

        $scope.project.installing = true;

        $scope.chooseDir()

            .then(function(dir) {
                var cmd = "cd " + dir + " && git clone " + $rootScope.git_repo;

                exec(cmd, function(error) {

                    if (error) {
                        $log.error("Error cloning project from "
                                   + $rootScope.git_repo + ": " + error);

                        $timeout(function() {
                            $scope.project.installing = false;
                            $scope.project.msg = "Error cloning project.";
                            $scope.project.installed = false;
                        });
                    }

                    else {
                        dir += dir.slice(-1) == slash ? '' : slash;
                        //TODO: set this correctly
                        $rootScope.project_path = dir;

                        $log.info($rootScope.project_path);

                        $timeout(function() {
                            $log.info("successfully cloned " + $rootScope.git_repo);
                            $scope.project.installing = false;
                            $scope.project.msg = "Your project is installed!";
                            $scope.project.installed = true;
                        });
                    }
                })
            })

            .catch(function(err) {
                $log.error("Error choosing parent directory: " + err);
                $timeout(function() {
                    $scope.project.installing = false;
                    $scope.project.msg = "Parent directory invalid.";
                    $scope.project.installed = false;
                });
            });

    };

});