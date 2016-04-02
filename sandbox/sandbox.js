console.log('sixth', sixth);

sixth.controller('testController', function() {
  this.binder = 'test';
  this.test = 0;
  this.select = 'testare';

  this.textarea = "textarea";

  this.checkbox = false;
  this.checkbox2 = true;
  this.radio = "Radio3";

  let myVar = 'testere';

  //setInterval(() => this.test++, 1000);
})