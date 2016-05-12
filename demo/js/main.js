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

  });