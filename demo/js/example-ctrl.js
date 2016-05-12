sixth.controller('ExampleCtrl', function() {
  this.user = {
    name: 'Borg',
    gender: 'male',
    message: 'Placeholder'
  };

  this.clickAction = '';

  this.myFunc = function(){
    this.clickAction = 'Yeeyy!!! you clicked me!!'
  }
});