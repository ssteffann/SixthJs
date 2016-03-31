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
    constructor(name, callback) {
      this.ctrlName = name;
      this.isClean = true;

      this.scope = new Proxy(new Scope(),{
        set: (model, property, value) => {
          let oldValue = model[property];

          if(oldValue === value) return;

          console.log('property', property)
          model[property] = value;

          oldValue && this.render(property, value)
        }
      });

      this.callback = callback;
      this.ctrlElement = document.querySelector(`[${CTRL_ATTR}=${name}]`);
      this.bindModel();
    }

    /**
     * Sort each element with data-model attribut to it model in scope
     * @returns {*}
     */
    bindModel(){
      let testFunction = function (name){
        return function(){
          console.log('ctrl.scope[name]', name, this.value)
          ctrl.scope[name] = this.value;
        }
      }
      let ctrl = this;
      this.callback.call(this.scope);

      let domElements = this.ctrlElement.querySelectorAll(`[${MODEL_ATTR}]`);
      this.modelElements = this.scope.getModel();

      for(let key in domElements) {
        let element = domElements[key];
        let name = element.tagName && element.getAttribute(MODEL_ATTR);

        if(!this.modelElements.hasOwnProperty(name)) return;

        this.modelElements[name].push(element);

        if (element.tagName === 'INPUT') {
          element.addEventListener('keyup', testFunction(name))
        }

        this.render(name, this.scope[name]);
      }
    }

    render(name, value) {
      this.modelElements[name].forEach((element) => {
        if (element.tagName === 'INPUT') {
          element.value = value;
        } else {
          element.innerHTML = value;
        }
      });
    }
  };


  self.controller = function(name, callback) {

    let ctrl = new Controller(name, callback);




    console.log('ctrl', ctrl)
  }


})();