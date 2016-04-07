(function(window, document){
  let self = {};

  window.sixth = self;

  const CTRL_ATTR = 'data-controller';
  const MODEL_ATTR = 'data-model';
  const BIND_ATTR = 'data-bind';
  const BINDING_TYPES = {
    model: {
      init: (element, scope, property) => {
        let setValue
          , eventsTypes
          , event;

        if(utils.isUndefined(element.value)) {
          return new logError(`SixthJs: Bind type model can't be applied on this element`)
        }

        setValue = function(event) {
          this.isTouched = true;
          scope[property] = event.target.value;
        };

        eventsTypes = {
          'checkbox': () => ({
            name: 'change',
            fn: function(event) {
              this.isTouched = true;
              scope[property] = event.target.checked;
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

        event = eventsTypes.hasOwnProperty(element.type)
          ? eventsTypes[element.type]()
          : { name: 'keyup', fn: setValue };

        element.addEventListener(event.name, event.fn, false);
      },
      render:(element, value) => {
        let elementsType = {
          checkbox: (element, value) => {
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
    },
    text: {
      init: () => true,
      render:(element, value) => {
        element.innerHTML = value;
      }
    },
    click: {
      init: () => {

      },
      render:() => true
    },
    change: {
      init: () => true,

    },
    if: {
      init: () => true,
      render:() => true
    },
    repeat: {
      init: () => true,
      render:() => true
    },
    view: {
      init: () => true,
      render:() => true
    },
    controller: {
      init: () => true,
      render:() => true
    }
  };

  let utils = {
    isUndefined: (value) => typeof value === 'undefined',
    isDefined: (value) => typeof value !== 'undefined'
  }

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

    return BINDING_TYPES.hasOwnProperty(obj.type)
      ? obj
      : new logError('Invalid syntax in binding: ' + attrValue)
  };

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

    bindModel() {
      this.scope = new Proxy(new Scope(),{
        set: (model, property, value) => {
          let oldValue = model[property];
          if(oldValue === value) return true;

          model[property] = value;

          this.render('model', property, value);
          this.render('text', property, value);

          return true;
        }
      });

      this.callback.call(this.scope);
      this.modelView = this.scope.getModel();
    }

    render(type, property, value){
      if(!this.modelView || !this.modelView[property][type]) return;

      this.modelView[property][type].forEach((element) => {
        BINDING_TYPES[type].render(element, value);
      })
    };

    getdomElemens() {
      return this.ctrlElement
        ? this.ctrlElement.querySelectorAll(`[${BIND_ATTR}]`)
        : []
    };

    /**
     * Sort each element with data-model attribut to it model in scope
     * @returns {*}
     */
    bindElements(elements){
      for (let i = 0, length = elements.length; i < length; i++) {
        let element = elements[i];

        if (!element.tagName) return;

        let data = parseAttrData(element.getAttribute(BIND_ATTR));

        if(!this.modelView.hasOwnProperty(data.value)) return;

        BINDING_TYPES[data.type].init(element, this.scope, data.value);

        this.modelView[data.value][data.type]
          ? this.modelView[data.value][data.type].push(element)
          : this.modelView[data.value][data.type] = [element];

        BINDING_TYPES[data.type].render(element, this.scope[data.value]);
      }
    };
  };




  self.controller = function(name, callback) {
    let ctrl = new Controller(name, callback);
    let elements = ctrl.getdomElemens();

    ctrl.bindModel();

    ctrl.bindElements(elements);

    console.log('ctrl', ctrl)
  }

})(window, document)