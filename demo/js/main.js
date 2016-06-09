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
  .controller('ToDoCtrl', function() {
    this.list = [{ name: 'Test the application' }, { name: 'Run' }];
    this.newTodo = '';

    this.done = function(item){

    };
    this.addItem = function() {
      if(!this.newTodo) return;

      this.list.push({name: this.newTodo});

      this.newTodo = '';
    };

  });