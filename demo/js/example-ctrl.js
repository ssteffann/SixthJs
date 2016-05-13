sixth.controller('ExampleCtrl', function() {
  this.user = {
    name: 'Borg',
    gender: 'male',
    message: 'Placeholder'
  };


  this.danger = false;
  this.info = false;

  this.clickAction = 'Make some action!!';


  this.myFunc = function(){
    this.clickAction = 'Yeeyy!!! you clicked me!!'
  };

  this.doubleClick = function(){
    this.clickAction = 'Nice!! you double clicked me!!!'
  };

  this.inputChange = function(){
    this.clickAction = 'The imput was changed!';
  };

  this.selectChange = function(){
    this.clickAction = 'The select was changed!';
  };
});