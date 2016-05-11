sixth.controller('MainCtrl', function(){
  let config =  sixth.inject('config');

  this.routes = config.routes;

  this.test = {
    prop: {
      ng: 'test'
    }
  };


  console.log('routes', this.routes)
});