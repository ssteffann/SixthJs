{
  let config = sixth.inject('config');
  sixth.route.config({ html5Mode: false });

  sixth.route
    .register({
      url: '/docs',
      templateUrl: 'partials/docs.html',
      controller: 'DocsCtrl'
    })
    .register({
      url: '/example',
      templateUrl: 'partials/example.html',
      controller: 'DocsCtrl'
    })
    .register({
      url: '/scores',
      templateUrl: 'partials/scores.html',
      controller: 'DocsCtrl'
    });

  console.log('sixth.route', sixth.route)
  sixth.route.onView('docsView');

  config.routes.forEach((route) =>  sixth.route.register(route));
  sixth.route.check();
}

