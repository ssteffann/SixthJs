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
  })
  .controller('ExCtrl', function() {
    this.type = '';
    this.bar = {
      first: 20,
      second: 40,
      third: 60
    };
    this.stacked = {
      first: 30,
      second: 25,
      third: 20
    };

    this.random = function() {
      const value = Math.floor(Math.random() * 100 + 1);
      let type;

      if (value < 25) {
        type = 'success';
      } else if (value < 50) {
        type = 'info';
      } else if (value < 75) {
        type = 'warning';
      } else {
        type = 'danger';
      }

      this.bar.third = value;
      this.bar.first = Math.floor(Math.random() * 100 + 1);
      this.bar.second = Math.floor(Math.random() * 100 + 1);
      this.type = type;
    };

    this.randomStacked = function() {
      this.stacked.third = Math.floor(Math.random() * 40 + 1);
      this.stacked.first = Math.floor(Math.random() * 30 + 1);
      this.stacked.second = Math.floor(Math.random() * 30 + 1);
    };
  });