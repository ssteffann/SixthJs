(function(window, document){
  let self = {};

  window.sixth = self;

  const CTRL_ATTR = 'data-controller';
  const MODEL_ATTR = 'data-model';
  const BIND_ATTR = 'data-bind';
  const RENDER_TYPES = ['model', 'text', 'if', 'repeat'];
  const BINDING_TYPES = {
    model: {
      init: function (element, property) {
        let setValue
          , eventsTypes
          , event;

        if(utils.isUndefined(element.value)) {
          return new logError(`SixthJs: Bind type model can't be applied on this element`)
        };

       this.registerElement(element, property, 'model')

        setValue = (event) => {
          element.isTouched = true;
          this.scope[property] = event.target.value;
        };

        eventsTypes = {
          'checkbox': () => ({
            name: 'change',
            fn: (event) => {
              element.isTouched = true;
              this.scope[property] = event.target.checked;
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
      render: function(element, value) {
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
      init: function(element, property) {
        this.registerElement(element, property, 'text')
      },
      render: function(element, value) {
        element.innerHTML = value;
      }
    },
    click: {
      init: function (element, property) {
        if (typeof this.scope[property] !== 'function') {
          return new logError(`SixthJs: ${property} is not a function.`)
        }

        element.addEventListener('click', () => this.scope[property](), false);
      },
      render:() => true
    },
    change: {
      init :function (element, property) {
        if (typeof this.scope[property] !== 'function') {
          return new logError(`SixthJs: ${property} is not a function.`)
        }

        element.addEventListener('change', () => this.scope[property](), false);
      },
      render: () => true
    },
    if: {
      init: function(element, property) {
        element.initHtml = element.innerHTML;

        this.registerElement(element, property, 'if')
      },
      render: function(element, value) {
        console.log('render if', value)
        if (value && !element.innerHTML) {
          let innerElements;

          element.innerHTML = element.initHtml;

          innerElements = utils.getdomElemens(element);

          this.bindElements(innerElements);
        } else if (!value) {
          element.innerHTML = '';
        }

      }
    },
    repeat: {
      init: function(element, property){
        if(!Array.isArray(this.scope[property])){
          return new logError(`SixthJs: Property [${property}] must be an Array.`)
        }

        if(!element.bindingTypes.alias) return;

        let copy = utils.copyObj(element.bindingTypes);

        delete copy.repeat;
        delete copy.alias;

        //TODO: Stringify the object
        element.setAttribute(BIND_ATTR, copy)
        element.initHtml = element.innerHTML;

        this.registerElement(element, property, 'repeat');
      },
      render: function(element, value) {
        let parent = element.parentNode
          , newElements = document.createDocumentFragment();

        let repeatEelements = utils.getdomElemens(element);
        value.forEach((item) => {
          let clone = element.cloneNode(true);

          let children = utils.getdomElemens(clone);

          for(let i in children){
            children[i].innerHTML = item;
          }

          console.log('children', children)

          newElements.appendChild(clone);
        });



        parent.insertBefore(newElements, element);
        // Remove the original
        parent.removeChild(element);
      }
    },
    item: {
      init: () => true,
      render:() => true
    },
    view: {
      init: () => true,
      render:() => true
    },
  };



  let utils = {
    isUndefined: (value) => typeof value === 'undefined',
    isDefined: (value) => typeof value !== 'undefined',
    getdomElemens:(domElement) => {
      return domElement
        ? domElement.querySelectorAll(`[${BIND_ATTR}]`)
        : []
    },
    copyObj: (object) => {
      return Object.keys(object).reduce((accum, key)=> {
        if (typeof object[key] === 'object') {
          accum[key] = this.copyObj(object[key])
        } else {
          accum[key] = object[key]
        }

        return accum;
      }, {})
    }
  }

  class logError {
    constructor(message) {
      throw new Error(message)
    }
  }

  let parseAttrData = function(attrValue) {
    try {
      let json = attrValue.replace(/[.\w\d-]+/g, '"$&"');

      return JSON.parse(json);
    } catch (err) {
      new logError('Invalid syntax in binding: ' + attrValue)
    }
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

          RENDER_TYPES.forEach((type) => this.render(type, property, value));

          return true;
        }
      });

      this.callback.call(this.scope);
      this.modelView = this.scope.getModel();
    };

    registerElement(element, property, type) {
      !element.isRegistered && this.modelView[property][type]
        ? this.modelView[property][type].push(element)
        : this.modelView[property][type] = [element];
    }

    render(type, property, value){
      if(!this.modelView || !this.modelView[property][type]) return;

      this.modelView[property][type].forEach((element) => {
        if(element.isTouched) return element.isTouched = false;

        BINDING_TYPES[type].render.call(this, element, value);
      })
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

        for (let type in data) {
          if(!this.modelView.hasOwnProperty(data[type])) return;

          if (!BINDING_TYPES.hasOwnProperty(type)) {
            return new logError('Invalid binding type in: ' + type)
          }

          element.bindingTypes = data;
         // element.isRegistered = true;
          BINDING_TYPES[type].init.call(this, element, data[type]);
          BINDING_TYPES[type].render.call(this, element, this.scope[data[type]]);
        }
      }
    };
  };




  self.controller = function(name, callback) {
    let ctrl = new Controller(name, callback);

    let elements = utils.getdomElemens(ctrl.ctrlElement);

    ctrl.bindModel();

    ctrl.bindElements(elements);

    console.log('ctrl', ctrl)
  }

})(window, document)