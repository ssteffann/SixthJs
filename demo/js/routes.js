{
  let config = sixth.inject('config');
  sixth.route.config({ html5Mode: false });

  sixth.route
    .register({
      url: '/example',
      templateUrl: 'partials/example.html',
      controller: 'DocsCtrl'
    })
    .register({
      url: '/scores',
      templateUrl: 'partials/scores.html',
      controller: 'DocsCtrl'
    })
    .register({
      url: '/docs',
      templateUrl: 'partials/docs.html',
      controller: 'DocsCtrl'
    })
    .children('docsView');

  config.routes.forEach((route) =>  sixth.route.register(route));

  sixth.route.check();
}

