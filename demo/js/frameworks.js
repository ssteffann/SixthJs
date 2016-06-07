sixth.service('frameworks', function () {
  const _random = (max) => Math.round(Math.random() * 1000) % max;

  this.buildData = function (count = 1000) {
    let adj = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
    let colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
    let nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

    return Array(count).fill(1).map((item, idex) => {
      return {
        id: index + 1,
        label: `${adj[_random(adj.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`
      }
    })
  };

  this.knockout = function() {
    ko.observableArray.fn.reset = function (values) {
      let array = this();
      this.valueWillMutate();
      ko.utils.arrayPushAll(array, values);
      this.valueHasMutated();
    };

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
  };

  this.react = function () {
    let Class = React.createClass({
      select: function (data) {
        this.props.selected = data.id;
        this.forceUpdate();
      },

      render: function () {
        let items = [];
        this.props.data.forEach((item) => {
          items.push(React.createElement("div", {className: "row"},
            React.createElement("div", {className: "col-md-12 test-data"},
              React.createElement("span", {
                className: this.props.selected === item.id ? "selected" : "",
                onClick: this.select.bind(null, item)
              }, item.label))
          ))
        });

        return React.createElement("div", null, items);
      }
    });

    let runReact = document.getElementById("run-react");
    runReact.addEventListener("click", function () {
      let data = _buildData(),
        date = new Date();

      React.render(new Class({data: data, selected: null}), document.getElementById("react"));
      runReact.innerHTML = (new Date() - date) + " ms";
    });
  };

  this.angular = function(){
    angular.module("test", []).controller("controller", function ($scope) {
      $scope.run = function () {
        let data = _buildData(),
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
  };

  this.rawJavaScript = function () {
    let container = document.getElementById("raw"),
      template = document.getElementById("raw-template").innerHTML;
    document.getElementById("run-raw").addEventListener("click", function () {
      let data = _buildData(),
        date = new Date(),
        html = "";

      for (let i = 0; i < data.length; i++) {
        let render = template;
        render = render.replace("{{className}}", "");
        render = render.replace("{{label}}", data[i].label);
        html += render;
      }

      container.innerHTML = html;

      let spans = container.querySelectorAll(".test-data span");
      for (let i = 0; i < spans.length; i++)
        spans[i].addEventListener("click", function () {
          let selected = container.querySelector(".selected");
          if (selected)
            selected.className = "";
          this.className = "selected";
        });

      document.getElementById("run-raw").innerHTML = (new Date() - date) + " ms";
    });
  }
});