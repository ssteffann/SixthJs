{
  let config = sixth.inject('config');
  sixth.route.config({ html5Mode: false });

  config.routes.forEach((route) =>  sixth.route.register(route));
  sixth.route.check();
}

