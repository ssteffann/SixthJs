sixth.controller('MainCtrl', function(){
  let config =  sixth.inject('config');

  this.routes = config.routes;

  console.log('routes', this.routes)
});