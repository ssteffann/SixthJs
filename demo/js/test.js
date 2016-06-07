sixth.controller('testingController', function () {
  let frameworks = sixth.inject('frameworks');

//  frameworks.react();
  frameworks.knockout();
  frameworks.angular();
 // frameworks.rawJavaScript();
})
  .controller('testCtrl', function(){
    this.data = [];

    this.run = function () {
      let data = _buildData(),
        date = new Date();

      this.data = data;

      document.getElementById("run-sixth").innerHTML = (new Date() - date) + " ms";
    }
  });