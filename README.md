# SixthJs
##Fast and lightweight JavaScript ES6 MVVM framework.

This framework is designed for developing modern web pages and web application. It
allows developers to adapt and extend main HTML features and create dynamic views with clean
and readable code. SixthJs build dynamic content of a web page through two - way data binding
that automatically synchronize changes from the model into the view and vice versa.

###Core Directives and Services
Directives | Services
------------ | -------------
Data-bind:model | $http
Data-bind:text ({{text}}) | router
Data-bind:click/dblclick | inject
Data-bind:change | service
Data-bind:class |
Data-bind:if |
Data-bind:include |
Data-bind:repeat |

###Framework Usage
####data-controller
```html
<div data-controller="MyController"></div>

<script>
  sixth.controller('MyController', function(){
    this.user = 'Borg';
 });
</script>
```
####data-bind:model
```html
<div data-controller="ExampleController" >
  <form name="myForm">
     Name: <input type="text"
                  data-bind="{model: client.name}"/>
  </form>
  Result: user.name = {{ client.name }}
</div>

<script>
  sixth.controller('ExampleController', function(){
    this.client = {
      name: 'SixthJs'
    };
  });
</script>
```
####data-bind:text {{}}
```html
<div data-controller="ExampleController" >
  <p>Hello my name is {{ client.name }}!!!</p>
</div>

<script>
  sixth.controller('ExampleController', function(){
    this.client = {
      name: 'Borg'
    };
  });
</script>
```
####data-bind:click/dblclick
```html
<div data-controller="ExampleController" >
  <button data-bind="{click: myFunction }">Click me </button>
  <button data-bind="{dblclick: myFunction }">Double click me</button>
</div>

<script>
  sixth.controller('ExampleController', function(){
    this.counter = 1;

    this.myFunction = function(){
      this.counter += 1;
    };
  });
</script>
```
####data-bind:change
```html
<div data-controller="ExampleController" >
  <input type="text" data-bind="{change: myFunction}"/>
</div>

<script>
  sixth.controller('ExampleController', function(){
    this.counter = 1;

    this.myFunction = function(){
      this.counter += 1;
    };
  });
</script>
```
####data-bind:class
```html
<div data-controller="ExampleController" >
  <input type="checkbox" data-bind="{model: property}"/>

  <p data-bind={class={ text-danger: property }}></p>
</div>

<script>
  sixth.controller('ExampleController', function(){
    this.property = false;
  });
</script>
```
####data-bind:if
```html
<div data-controller="ExampleController">
  <input type="checkbox" data-bind="{model: property}"/>

  <div data-bind="{if: property }">
    <textarea data-bind="{model: action}"></textarea>
      <p>Hello World!</p>
      <p>{{ action }}</p>
  </div>
</div>

<script>
  sixth.controller('ExampleController', function(){
    this.property = true;
  });
</script>
```
####data-bind:include
```html
<div data-bind="{include: partials/mytemplate.html }"></div>
```
####data-bind:repeat
```html
<div data-controller="ExampleController">
  <button data-bind="{click: addItem}"/>Add<button>
  <button data-bind="{click: delItem}"/>Delete<button>

  <ul>
    <li data-bind="{repeat: customers, alias: customer }">
      Name:{{ customer.name }}
    </li>
  </ul>
</div>

<script>
  sixth.controller('ExampleController', function(){
    this.customers = [{ name: 'Customer1' }, { name: 'Customer2' }];
  });
</script>
```
####data-view
```html
<div data-view=""></div>
<div data-view="secondView"></div>
```
