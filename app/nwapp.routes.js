app.config(function ($routeProvider) {
    $routeProvider

        .when('/route', {
            templateUrl: 'app/components/RouteView/routeview.partial.html',
            controller: 'routeViewController'
        })

        .otherwise('/');

});
