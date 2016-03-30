(function() {
  const CTRL_ATTR = 'data-controller';
  const MODEL_ATTR = 'data-model';

  let self = {}

  window.sixth = self;

  class Scope {
    constructor(){}

    getModel() {
      return Object.keys(this)
        .reduce((mappedData, key) => {
          mappedData[key] = [];

          return mappedData
        }, {});
    }
  };

  class Controller {
    constructor(name, callback, scope) {
      this.ctrlName = name;
      this.scope = scope;
      this.callback = callback;
      this.ctrlElement = document.querySelector(`[${CTRL_ATTR}=${name}]`);
      this.modelElements = this.bindModel();
    }

    /**
     * Sort each element with data-model attribut to it model in scope
     * @returns {*}
     */
    bindModel(){
      let domElements = this.ctrlElement.querySelectorAll(`[${MODEL_ATTR}]`)
        , modelElements = this.scope.getModel();

      for(let key in domElements) {
        let element = domElements[key];
        let name = element.tagName && element.getAttribute(MODEL_ATTR);

        if(!modelElements.hasOwnProperty(name)) return;

        modelElements[name].push(element);
      }

      return modelElements;
    }

    render (name, value) {
      for(let key in this.modelElements) {
        let element = this.modelElements[key];

        if (element.tagName && element.getAttribute(MODEL_ATTR) === name) {
          if (element.tagName === 'INPUT') {
            element.value = value;
          } else {
            element.innerHTML = value;
          }

        }

      }
    }
  };


  self.controller = function(name, callback) {
    let scope = new Proxy(new Scope(),{
      set: function(model, property, value) {
        let oldValue = model[property];

        if(oldValue === value) return;

        model[property] = value;
        //ctrl.render(property, value)

      }
    });
    callback.call(scope)

    let ctrl = new Controller(name, callback, scope);



    for(let key in ctrl.modelElements) {
      let element = ctrl.modelElements[key]

      if(element.tagName === 'INPUT'){
        element.addEventListener('keyup', function(){
          scope[element.getAttribute(MODEL_ATTR)] = this.value;
        })
      }
    }


    console.log('scope', scope)
    console.log('ctrl', ctrl)
  }


})();