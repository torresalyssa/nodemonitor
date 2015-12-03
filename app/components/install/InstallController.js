app.controller("installController", function ($scope, $rootScope, $log, $timeout, $q, $window,
                                              $modal, fileDialog, userDefaults, updateService) {

    var slash = (process.platform === "win32") ? "\\" : "/";  // check if windows - windows will
                                                              // give 'win32' even if it is 64-bit

    $scope.ready = false;

    $scope.node = {
        "installed": false,
        "installing": false,
        "msg": ""
    };

    $scope.npm = {
        "installed": false,
        "installing": false,
        "msg": ""
    };

    $scope.bower = {
        "installed": false,
        "installing": false,
        "msg": ""
    };

    $scope.pm2 = {
        "installed": false,
        "installing": false,
        "msg": ""
    };

    $scope.project = {
        "installed": false,
        "installing": false,
        "msg": ""
    };

    /* check if node.js is installed */
    exec("node -v", function(error) {
        if (error !== null) {
            $timeout(function() {
                $scope.ready = true;
            })
        }

        else {
            $scope.node.installed = true;
            $scope.node.msg = "Node.js is already installed";

            /* check if bower is installed */
            exec("bower -v", function(error) {
                if (error === null) {
                    $scope.bower.installed = true;
                    $scope.bower.msg = "Bower is already installed";
                }

                /* check if npm is installed */
                exec("npm -v", function(error) {
                    if (error === null) {
                        $scope.npm.installed = true;
                        $scope.npm.msg = "npm is already installed";

                        /* check if pm2 is installed */
                        exec("pm2 -v", function (error) {
                            if (error === null) {
                                $scope.pm2.installed = true;
                                $scope.pm2.msg = "PM2 is already installed";
                            }

                            /* check if the project is installed */
                            if (!$rootScope.project_path)
                                $scope.project.installed = false;
                            else {
                                $scope.project.installed = true;
                                $scope.project.msg = $rootScope.project_name + " is already installed";
                            }

                            $timeout(function() {
                                $scope.ready = true;
                            });

                        });
                    }
                    else {
                        $timeout(function() {
                            $scope.ready = true;
                        })
                    }
                })
            });
        }
    });

    $scope.installNode = function() {
        $window.open("https://nodejs.org");
    };

    $scope.installNpm = function() {
        $window.open("https://nodejs.org");
    };


    $scope.installBower = function() {
        $log.info("installing bower...");

        $scope.bower.installing = true;


        var child = exec('npm install bower -g', function(err, stdout, stderr) {
            $log.info("stdout: " + stdout);
            $log.info("stderr: " + stderr);

            if (err) {
                $scope.bower.msg = "Error installing Bower. Check Help page.";
            }
            else {
                $scope.bower.msg = "Bower is installed!";
                $scope.bower.installed = true;
            }

            $timeout(function() {
                $scope.bower.installing = false;
            });
        });

    };


    $scope.installPm2 = function() {

        $log.info("installing pm2...");

        $scope.pm2.installing = true;


        var child = exec('npm install pm2 -g', function(err, stdout, stderr) {
            $log.info("stdout: " + stdout);
            $log.info("stderr: " + stderr);

            if (err) {
                $scope.pm2.msg = "Error installing PM2. Check Help page.";
            }
            else {
                $scope.pm2.msg = "PM2 is installed!";
                $scope.pm2.installed = true;
            }

            $timeout(function() {
                $scope.pm2.installing = false;
            });
        });

        /*var modal = $modal.open({
            templateUrl: 'app/components/install/modal.html',
            controller: 'modalController'
        });

        modal.result
            .then(function(pwd) {
                child.stdin.write(pwd );
                child.stdin.end();
            });*/

    };


    $scope.chooseDir = function() {

        return $q(function(res) {
            fileDialog.openDir(function(dir) {
                res(dir);
                $scope.$broadcast('DIR_CHOSEN', { dir: dir });
            })
        });
    };

    $scope.$on('DIR_CHOSEN', function(event, args) {
        var dir = args.dir;
        var cmd = "cd \"" + dir + "\" && git clone " + $rootScope.git_repo;

        $log.info("cloning project at " + $rootScope.git_repo + "...");
        $log.info(cmd);

        $timeout(function() {
            $scope.project.installing = true;
        });

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

                if ($rootScope.git_repo.slice(-1) == '/')
                    $rootScope.git_repo = $rootScope.git_repo.slice(0, -1);

                $rootScope.project_path = dir +
                    $rootScope.git_repo.slice($rootScope.git_repo.lastIndexOf("/") + 1,
                        $rootScope.git_repo.lastIndexOf(".git")) + slash;

                updateService.bowerAndNpmUpdate($rootScope.project_path)
                    .then(function() {

                        exec("pm2 kill", function() {
                            userDefaults.setStringForKey("project_path", $rootScope.project_path);
                            $timeout(function() {
                                $log.info("successfully cloned " + $rootScope.git_repo);
                                $scope.project.installing = false;
                                $scope.project.msg = $rootScope.project_name + " is installed!";
                                $scope.project.installed = true;
                            });
                        });

                    }, function(err) {
                        $rootScope.project_path = null;
                        $timeout(function() {
                            $log.error("Error doing npm/bower updates: " + err);
                            $scope.project.installing = false;
                            $scope.project.msg = "Error installing project.";
                            $scope.project.installed = false;
                        });
                    });
            }
        })
    });


    $scope.installProject = function() {

        $scope.project.msg = "";

        $scope.chooseDir();

    };

});