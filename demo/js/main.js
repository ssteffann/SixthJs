sixth.controller('MainCtrl', function () {

  this.test = {
    prop: {
      ng: 'test'
    }
  };
})
  .controller('DocsCtrl', function () {
    let config = sixth.inject('config');

    this.routes = config.routes;
    this.current = '';

    sixth.router.onRouteChange((currentState) => {
      this.current = currentState.name;
    });


  });