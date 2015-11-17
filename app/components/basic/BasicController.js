app.controller("basicController", function ($scope, $rootScope, $log, $http) {

    $scope.sstubby_status = "";
    $scope.pm2_status = "";

    var _data = undefined;

    $scope.getPMStatus = function() {

        $http.get($rootScope.pm2_endpt)

            .then(function(data) {
                $scope.pm2_status = "Running";
                _data = data.data;
            })

            .catch(function(err) {
                $log.error("Unable to get monitoring info: " + err);
                $scope.pm2_status = "Not running";
            });
    };

    $scope.getSBYStatus = function() {

        $http.get($rootScope.ping_endpt)

            .then(function(data) {
                $scope.sstubby_status = "Running";
                $log.info(data);
            })

            .catch(function() {
                $scope.sstubby_status = "Not running";
            });
    };

    $scope.getPMStatus();
    $scope.getSBYStatus();

});