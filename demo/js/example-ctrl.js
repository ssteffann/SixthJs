sixth.controller('ExampleCtrl', function() {
  this.user = {
    name: 'Borg',
    gender: 'male',
    message: 'Placeholder',
    collection: [ { name: 'Customer1' }, { name: 'Customer2' }]
  };


  this.danger = false;
  this.info = false;

  this.clickAction = 'Make some action!!';


  this.addItem = function () {
    let length = this.user.collection.length;

    this.user.collection.push({name: `Customer_${length + 1}`})
  };

  this.delItem = function () {
    this.user.collection.splice(-1, 1)
  };

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