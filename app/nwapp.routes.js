app.config(function ($routeProvider) {
    $routeProvider

        .when('/advanced', {
            templateUrl: 'app/components/advanced/advancedview.partial.html',
            controller: 'advancedController'
        })

        .when('/basic', {
            templateUrl: 'app/components/basic/basicview.partial.html',
            controller: 'basicController'
        })

        .when('/help', {
            templateUrl: 'app/components/help/help.partial.html',
            controller: 'helpController'
        })

        .otherwise('/basic');

});
