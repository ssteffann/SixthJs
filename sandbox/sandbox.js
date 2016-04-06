console.log('sixth', sixth);

sixth.controller('testController', function() {
  this.binder = 'test';
  this.test = 0;
  this.select = 'stare';

  this.textarea = "textarea";

  this.checkbox = false;
  this.checkbox2 = true;
  this.radio = "Radio3";

  let myVar = 'testere';

  this.myObj = {
    property: 'work'
  }


  this.myFunction = function(){
    console.log('me Function');
  }

  setInterval(() => this.test++, 1000);
});


sixth.controller('childColtroller', function() {
  this.child = 'child';
})