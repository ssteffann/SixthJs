sixth.controller('ExampleCtrl', function() {
  let elem = [];

  for(let i =0; i<1000;i++){
    elem.push({name: `Customer_${i + 1}`})
  }

  this.user = {
    name: 'Borg',
    gender: 'male',
    message: 'Placeholder',
    collection: elem
  };

  this.danger = false;
  this.test = 'bla bls';
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