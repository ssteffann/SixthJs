
document.addEventListener("DOMContentLoaded", function () {
  _knockout();
  _react();
  _raw();
  _sixth();
});

_angular();

function _buildData(count) {
  count = count || 1000;

  var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
  var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
  var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
  var data = [];
  for (var i = 0; i < count; i++)
    data.push({
      id: i + 1,
      label: adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)]
    });
  return data;
}

function _random(max) {
  return Math.round(Math.random() * 1000) % max;
}

function _knockout() {
  ko.applyBindings({
    selected: ko.observable(),
    data: ko.observableArray(),

    select: function (item) {
      this.selected(item.id);
    },

    run: function () {
      var data = _buildData(),
        date = new Date();

      this.selected(null);
      this.data(data);
      document.getElementById("run-knockout").innerHTML = (new Date() - date) + " ms";
    }
  }, document.getElementById("knockout"));
}

function _angular(data) {
  angular.module("test", []).controller("controller", function ($scope) {
    $scope.run = function () {
      var data = _buildData(),
        date = new Date();

      $scope.selected = null;
      $scope.$$postDigest(function () {
        document.getElementById("run-angular").innerHTML = (new Date() - date) + " ms";
      });

      $scope.data = data;
    };

    $scope.select = function (item) {
      $scope.selected = item.id;
    };
  });
}

function _sixth() {
  sixth.controller('testCtrl', function() {
    this.data = [];

    this.select = function(){
      console.log('selected from sixthJs');
    };
    this.run = function () {
      var data = _buildData(),
        date = new Date();

      this.data = data;

      document.getElementById("run-sixth").innerHTML = (new Date() - date) + " ms";
    }
  });
};

function _react() {
  var Class = React.createClass({
    select: function (data) {
      this.props.selected = data.id;
      this.forceUpdate();
    },

    render: function () {
      var items = [];
      for (var i = 0; i < this.props.data.length; i++) {
        items.push(React.createElement("div", {className: "row"},
          React.createElement("div", {className: "col-md-12 test-data"},
            React.createElement("span", {
              className: this.props.selected === this.props.data[i].id ? "selected" : "",
              onClick: this.select.bind(null, this.props.data[i])
            }, this.props.data[i].label)
          )
        ));
      }

      return React.createElement("div", null, items);
    }
  });

  var runReact = document.getElementById("run-react");
  runReact.addEventListener("click", function () {
    var data = _buildData(),
      date = new Date();

    React.render(new Class({data: data, selected: null}), document.getElementById("react"));
    runReact.innerHTML = (new Date() - date) + " ms";
  });
}

function _raw() {
  var container = document.getElementById("raw"),
    template = document.getElementById("raw-template").innerHTML;
  document.getElementById("run-raw").addEventListener("click", function () {
    var data = _buildData(),
      date = new Date(),
      html = "";

    for (var i = 0; i < data.length; i++) {
      var render = template;
      render = render.replace("{{className}}", "");
      render = render.replace("{{label}}", data[i].label);
      html += render;
    }

    container.innerHTML = html;

    var spans = container.querySelectorAll(".test-data span");
    for (var i = 0; i < spans.length; i++)
      spans[i].addEventListener("click", function () {
        var selected = container.querySelector(".selected");
        if (selected)
          selected.className = "";
        this.className = "selected";
      });

    document.getElementById("run-raw").innerHTML = (new Date() - date) + " ms";
  });
}

ko.observableArray.fn.reset = function (values) {
  var array = this();
  this.valueWillMutate();
  ko.utils.arrayPushAll(array, values);
  this.valueHasMutated();
};
