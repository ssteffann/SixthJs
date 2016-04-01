 console.log('sixth', sixth);

 sixth.controller('testController', function() {
  this.binder = 'test';
   this.test = 0;
  this.select='testare';

  let myVar = 'testere';

  setInterval(() => this.test++, 1000);
 })