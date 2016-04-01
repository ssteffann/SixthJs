(function() {
  const CTRL_ATTR = 'data-controller';
  const MODEL_ATTR = 'data-model';

  let self = {}

  window.sixth = self;

  /**
   * Work in progress
   */
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

  /**
   * Controller class that bind model and view
   */
  class Controller {
    constructor(name, callback) {
      this.ctrlName = name;
      this.isBinded = false;

      this.scope = new Proxy(new Scope(),{
        set: (model, property, value) => {
          let oldValue = model[property];

          if(oldValue === value) return true;

          model[property] = value;

          this.isBinded && this.render(property, value)

          return true;
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
      let domElements = this.ctrlElement.querySelectorAll(`[${MODEL_ATTR}]`);

      this.callback.call(this.scope);
      this.modelView = this.scope.getModel();

      for(let key in domElements) {
        let element = domElements[key];
        let name = element.tagName && element.getAttribute(MODEL_ATTR);

        if(!this.modelView.hasOwnProperty(name)) return;

        this.modelView[name].push(element);

        if (element.tagName === 'INPUT') {
          element.addEventListener('keyup', () => {
            this.scope[name] = element.value;
          });
        }

        this.isBinded = true;
        this.render(name, this.scope[name]);
      }
    }

    render(name, value) {
      this.modelView[name].forEach((element) => {
        if (element.tagName === 'INPUT' && !element.value) {
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