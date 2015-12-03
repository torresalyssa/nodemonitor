app.config(function ($routeProvider) {
    $routeProvider

        .when('/advanced', {
            templateUrl: 'app/components/advanced/advanced.partial.html',
            controller: 'advancedController'
        })

        .when('/basic', {
            templateUrl: 'app/components/basic/basic.partial.html',
            controller: 'basicController'
        })

        .when('/update', {
            templateUrl: 'app/components/update/update.partial.html',
            controller: 'updateController'
        })

        .when('/help', {
            templateUrl: 'app/components/help/help.partial.html',
            controller: 'helpController'
        })

        .when('/install', {
            templateUrl: 'app/components/install/install.partial.html',
            controller: 'installController'
        })

        .when('/config', {
            templateUrl: 'app/components/config/config.partial.html',
            controller: 'configController'
        })

        .otherwise('/basic');

});
