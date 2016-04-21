console.log('sixth', sixth);

sixth.route.config({ html5Mode: false });

sixth.route
  .register({
    url: '/checkbox',
    templateUrl: 'partials/checkbox.html',
    controller: 'CheckboxCtrl'
  })
  .register({
    url: '/inputs',
    templateUrl: 'partials/inputs.html',
    controller: 'SelectCtrl'
  })
  .register({
    url: '/parrent',
    templateUrl: 'partials/parent-tpl.html',
    controller: 'RepeaterCtrl'
  })
  .check();

sixth.controller('testController', function() {
  this.binder = 'test';

  this.myObj = {
    property: 'work'
  };
  let getTime = () => {
    let time = new Date();

    return `${time.toLocaleTimeString()} ${time.toLocaleDateString()}`;
  }


  this.time = getTime();
  setInterval(() => this.time = getTime(), 1000);
})

  .controller('CheckboxCtrl', function() {

    this.checkbox = false;
    this.checkbox2 = true;


    this.radio = "Radio3";
  })

  .controller('SelectCtrl', function() {
    this.textarea = "textarea";
    this.test = 'testerel';

    this.select = 'test';
    this.showData = true;

    this.onSelect = function() {
      console.log('You just selected something', this.select);
    }
  })

  .controller('RepeaterCtrl', function() {
    this.collection = ['test', 'test2', 'test3', 'test4'];

    this.addItem = function() {
      let item = `New Item: ${this.counter} `;

      this.collection.push(item);
      console.log(this.collection)
    }

    this.removeItem = function() {
      this.collection.splice(-1, 1)
      console.log(this.collection)
    };
  })

  .controller('childColtroller', function() {
    this.function = '';
    this.clickButton = function() {
      this.function = 'Yeyy you clicked the button'
      console.log('clickButton');
    }

    this.clickLink = function() {
      this.function = 'Yeyy you clicked the link'
      console.log('clickLink');
    }
    this.child = 'child';
  })