{
  let config = sixth.inject('config');
  sixth.router.config({ html5Mode: false });

  sixth.router
    .register({
      url: '/docs',
      templateUrl: 'partials/docs.html',
      controller: 'DocsCtrl'
    })
    .register({
      url: '/example',
      templateUrl: 'partials/example.html',
      controller: 'ToDoCtrl'
    })
    .children('docsView');

  config.routes.forEach((route) =>  sixth.router.register(route));

  sixth.router.check();
}

