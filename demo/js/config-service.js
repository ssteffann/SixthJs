sixth.service('config', function(){
  this.routes = [
    {
      name: 'data-bind:model',
      url: '/model',
      controller: 'ExampleCtrl',
      templateUrl: 'partials/docs/model.html'
    },
    {
      name: 'data-bind:text',
      url: '/text',
      controller: 'ExampleCtrl',
      templateUrl: 'partials/docs/text.html'
    },
    {
      name: 'data-bind:click',
      url: '/click',
      controller: 'ExampleCtrl',
      templateUrl: 'partials/docs/click.html'
    },
    {
      name: 'data-bind:dblclick',
      url: '/dblclick',
      controller: 'ClickCtrl',
      templateUrl: 'partials/docs/click.html'
    },
    {
      name: 'data-bind:change',
      url: '/change',
      controller: 'ClickCtrl',
      templateUrl: 'partials/docs/click.html'
    },
    {
      name: 'data-bind:class',
      url: '/class',
      controller: 'ClassCtrl',
      templateUrl: 'partials/docs/class.html'
    },
    {
      name: 'data-bind:if',
      url: '/if',
      controller: 'IfCtrl',
      templateUrl: 'partials/docs/if.html'
    },
    {
      name: 'data-bind:repeat',
      url: '/repeat',
      controller: 'RepeatCtrl',
      templateUrl: 'partials/docs/repeat.html'
    },
    {
      name: 'data-view',
      url: '/data-view',
      controller: 'ViewCtrl',
      templateUrl: 'partials/docs/view.html'
    },
    {
      name: 'data-controller',
      url: '/data-controller',
      controller: 'ControllerCtrl',
      templateUrl: 'partials/docs/controller.html'
    },
  ]
})