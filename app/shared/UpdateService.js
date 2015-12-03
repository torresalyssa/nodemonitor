angular.module('update.service', [])
    .factory('updateService', function($q, $log) {

        var service = {};

        /* exec returning a promise */
        function pexec(cmd) {

            return $q(function(resolve, reject) {
                exec(cmd, function(error, stdout, stderr) {

                    if (error !== null) {
                        $log.error("Error in exec for " + cmd);
                        $log.error(stderr);
                        reject(error);
                    }

                    else {
                        resolve(stdout);
                    }
                })
            })
        }

        function npmUpdateAll(arr) {
            var promises = [], p;

            arr.forEach(function(obj, idx) {
                arr[idx] = arr[idx].replace("package.json", "");

                if (arr[idx] != "") {
                    p = pexec("cd \"" + arr[idx] + "\" && npm update");
                    promises.push(p);
                }
            });

            return $q.all(promises);
        }

        service.npmUpdate = function(path) {
            var npms = [], i;
            var npmFind = "find \"" + path +
                "\" -name 'package.json' | grep -v node_modules | grep -v bower_components";

            return $q(function(resolve, reject) {

                // Find where we need npm updates
                pexec(npmFind)
                    .then(function(stdout) {
                        npms = stdout.toString().split("\n");

                        // Do npm updates
                        npmUpdateAll(npms)
                            .then(function() {
                                resolve();
                            }, function() {
                                reject();
                            });

                    }, function(err) {
                        reject(err);
                    });
            });
        };

        function bowerUpdateAll(arr) {
            var promises = [], p;

            arr.forEach(function(obj, idx) {
                arr[idx] = arr[idx].replace("bower.json", "");

                if (arr[idx] != "") {
                    p = pexec("cd \"" + arr[idx] + "\" && bower update");
                    promises.push(p);
                }
            });

            return $q.all(promises);
        }

        service.bowerUpdate = function(path) {

            var bowers = [], i;
            var bowerFind = "find \"" + path +
                            "\" -name 'bower.json' | grep -v node_modules | grep -v bower_components";

            return $q(function(resolve, reject) {

                // Find where we need bower updates
                pexec(bowerFind)
                    .then(function(stdout) {
                        bowers = stdout.toString().split("\n");

                        // Do bower updates
                        bowerUpdateAll(bowers)
                            .then(function() {
                                resolve();
                            }, function() {
                                reject();
                            });

                    }, function(err) {
                        reject(err);
                    });
            });

        };

        service.bowerAndNpmUpdate = function(path) {
            var bu = service.bowerUpdate(path);
            var nu = service.npmUpdate(path);

            return $q.all([bu, nu]);
        };

        return service;

    });