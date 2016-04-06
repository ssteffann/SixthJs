(function(window, document){
  let self = {};

  window.sixth = self;

  const CTRL_ATTR = 'data-controller';
  const MODEL_ATTR = 'data-model';
  const BIND_ATTR = 'data-bind';
  const BINDING_TYPES = ['model', 'text', 'click', 'change', 'if', 'repeat', 'view', 'controller'];


  let utils = {
    isUndefined: (value) => typeof value === 'undefined',
    isDefined: (value) => typeof value !== 'undefined'
  }

  //TODO: Implement this types of bindings

  class logError {
    constructor(message) {
      throw new Error(message)
    }
  }

  let parseAttrData = function(attrValue) {
    let data = attrValue.split(':');

    let obj = {
      type: data[0].trim(),
      value: data[1].trim()
    }

    return BINDING_TYPES.find((type) => type === obj.type)
      ? obj
      : new logError('Invalid syntax in binding: ' + attrValue)
  };

  function renderInputType(element, value){
    let elementsType = {
      checkbox: (element, value) => {
        console.log('value', !!value)
        element.setAttribute('checked', value);
      },
      radio: (element, value) => {
        if (element.value === value && !element.checked) {
          element.setAttribute('checked', true);
        }
      },
      default: (element, value) => {
        element.value = value;
      }
    };

    elementsType.hasOwnProperty(element.type)
      ? elementsType[element.type](element, value)
      : elementsType.default(element, value);
  }


  class Scope {
    constructor(){}

    getModel() {
      return Object.keys(this)
        .reduce((mappedData, key) => {
          mappedData[key] = {};

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
      this.callback = callback;
      this.ctrlElement = document.querySelector(`[${CTRL_ATTR}=${name}]`);
    }

    buildScope() {
      this.$scope = new Scope();

      this.callback.call(this.$scope);
      this.modelView = this.$scope.getModel();
    };

    getEvent(type, name) {
      let that = this;
      let setValue = function(event) {
        this.isTouched = true;
        that.scope[name] = event.target.value;
      };

      let eventsTypes = {
        'default': () => ({
          name: 'keyup',
          fn: setValue
        }),
        'checkbox': () => ({
          name: 'change',
          fn: function(event) {
            this.isTouched = true;
            that.scope[name] = event.target.checked;
          }
        }),
        'radio': () => ({
          name: 'change',
          fn: setValue
        }),
        'select-one': () => ({
          name: 'change',
          fn: setValue
        })
      }

      return eventsTypes.hasOwnProperty(type)
        ? eventsTypes[type]()
        : eventsTypes.default();
    };

    renderViewModel(property, value) {
      if(!this.modelView[property].model) return;

      this.modelView[property].model.forEach((element) => {
        if(element.isTouched) return element.isTouched = false;

        renderInputType(element, value);
      })
    };

    renderText(property, value){
      if(!this.modelView[property].text) return;

      this.modelView[property].text.forEach((element) => {
        element.innerHTML = value;
      })
    }

    render(property, value){
      this.renderViewModel(property, value);
      this.renderText(property, value);
    }

    bindModel() {
      this.scope = new Proxy(this.$scope,{
        set: (model, property, value) => {
          let oldValue = model[property];
          console.log('set', value);
          if(oldValue === value) return true;

          model[property] = value;

          console.log('set', value);
          this.render(property, value);

          return true;
        }
      });
    }
    /**
     * Sort each element with data-model attribut to it model in scope
     * @returns {*}
     */
    bindElements(){
      if(!this.ctrlElement) return;
      let domElements = this.ctrlElement.querySelectorAll(`[${BIND_ATTR}]`)

      for (let i = 0, length = domElements.length; i < length; i++) {
        let element = domElements[i];

        if (!element.tagName) {
          return;
        }

        let data = parseAttrData(element.getAttribute(BIND_ATTR));

        if(!this.modelView.hasOwnProperty(data.value)) return;

        this.modelView[data.value][data.type]
          ? this.modelView[data.value][data.type].push(element)
          : this.modelView[data.value][data.type] = [element]


        if (utils.isDefined(element.value) && data.type === 'model') {
          let event = this.getEvent(element.type, data.value);

          element.addEventListener(event.name, event.fn, false);
        }

        console.log('parsedData', data);

        // this.bindModel(scope);
         this.render(data.value, this.$scope[data.value]);
      }
    };

  };


  self.controller = function(name, callback) {
    let ctrl = new Controller(name, callback);
    ctrl.buildScope();

    ctrl.bindElements();

    ctrl.bindModel();


    console.log('ctrl', ctrl)
  }

})(window, document)