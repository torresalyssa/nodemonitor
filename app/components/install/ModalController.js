app.controller("modalController", function ($scope, $rootScope, $modalInstance) {

    $scope.pwd = undefined;

    $scope.ok = function() {
        $modalInstance.close($scope.pwd);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

});