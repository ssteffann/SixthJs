console.log('sixth', sixth);

sixth.controller('testController', function() {
  this.binder = 'test';
  this.test = 'testerel';
  this.counter = 0;
  this.select = 'test';
  this.onSelect = function(){
    console.log('You just selected something', this.select);
  }

  this.showData = true;

  this.textarea = "textarea";

  this.checkbox = 'false';
  this.checkbox2 = 'true';
  this.radio = "Radio3";

  let myVar = 'testere';

  this.myObj = {
    property: 'work'
  }



  setInterval(() =>  this.counter++, 1000);
});


sixth.controller('childColtroller', function() {
  this.function ='';
  this.clickButton = function(){
    this.function = 'Yeyy you clicked the button'
    console.log('clickButton');
  }

  this.clickLink = function() {
    this.function = 'Yeyy you clicked the link'
    console.log('clickLink');
  }
  this.child = 'child';
})