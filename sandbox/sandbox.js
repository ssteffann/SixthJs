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
	});

sixth.controller('testController', function() {
	this.binder = 'test';
	this.test = 'testerel';
	this.counter = 0;

	this.myObj = {
		property: 'work'
	};

	setInterval(() =>  this.counter++, 1000);
})

	.controller('CheckboxCtrl', () => {
		this.textarea = "textarea";

		this.checkbox = 'false';
		this.checkbox2 = 'true';
		this.radio = "Radio3";
	})

	.controller('SelectCtrl', () => {
		this.select = 'test';
		this.onSelect = function() {
			console.log('You just selected something', this.select);
		}

		this.showData = true;
	})

	.controller('RepeaterCtrl', () => {
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