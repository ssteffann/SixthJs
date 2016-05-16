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
    this.current =  sixth.router.getCurrentState().name;

    sixth.router.onRouteChanged((currentState) => {
      this.current = currentState.name;
    });
  });