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

  this.collection =['test', 'test2', 'test3', 'test4'];

  let myVar = 'testere';

  this.myObj = {
    property: 'work'
  };

  this.addItem = function(){
    let item = `New Item: ${this.counter} `;

    this.collection.push(item);
    console.log(this.collection)
  }

  this.removeItem = function(){
    this.collection.splice(-1,1)
    console.log(this.collection)
  };


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