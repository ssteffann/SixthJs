sixth.service('config', function(){
  this.routes = [
    {
      name: 'model',
      url: '/model',
      controller: 'ModelCtrl',
      templateUrl: 'partials/docs/model.html'
    },
    {
      name: 'text',
      url: '/text',
      controller: 'TextCtrl',
      templateUrl: 'partials/docs/text.html'
    },
    {
      name: 'attr',
      url: '/attr',
      controller: 'TextCtrl',
      templateUrl: 'partials/docs/text.html'
    },
    {
      name: 'click',
      url: '/click',
      controller: 'ClickCtrl',
      templateUrl: 'partials/docs/click.html'
    },
    {
      name: 'dblclick',
      url: '/dblclick',
      controller: 'ClickCtrl',
      templateUrl: 'partials/docs/click.html'
    },
    {
      name: 'change',
      url: '/change',
      controller: 'ClickCtrl',
      templateUrl: 'partials/docs/click.html'
    },
    {
      name: 'class',
      url: '/class',
      controller: 'ClassCtrl',
      templateUrl: 'partials/docs/class.html'
    },
    {
      name: 'if',
      url: '/if',
      controller: 'IfCtrl',
      templateUrl: 'partials/docs/if.html'
    },
    {
      name: 'repeat',
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