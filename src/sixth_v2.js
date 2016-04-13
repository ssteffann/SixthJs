(function(window, document) {
  let self = {};

  window.sixth = self;

  const CTRL_ATTR = 'data-controller';
  const MODEL_ATTR = 'data-model';
  const BIND_ATTR = 'data-bind';
  const REPEAT ={
    START: 'data-repeat-start',
    STOP: 'data-repeat-stop'
  }
  const RENDER_TYPES = ['model', 'text', 'if'];
  const BINDING_TYPES = {
    model: {
      init: function(element, scope, property, stopRegister) {
        let setValue
          , eventsTypes
          , event;

        if (utils.isUndefined(element.value)) {
          return new logError(`SixthJs: Bind type model can't be applied on this element`);
        }


        (!stopRegister)&&this.registerElement(element, property, 'model')

        setValue = (event) => {
          element.isTouched = true;
          scope[property] = event.target.value;
        };

        eventsTypes = {
          'checkbox': () => ({
            name: 'change',
            fn: (event) => {
              element.isTouched = true;
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
      render: function(element, value) {
        //console.log('render model')

        let elementsType = {
          checkbox: (element, value) => {
            element.setAttribute('checked', value);
          },
          radio: (element, value) => {
            if (element.value === value&& !element.checked) {
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
      init: function(element, scope, property, stopRegister) {
        //console.log('init');
        (!stopRegister)&&this.registerElement(element, property, 'text')
      },
      render: function(element, value) {
        //console.log('render text')

        element.innerHTML = value;
      }
    },
    click: {
      init: function(element, scope, property) {
        if (typeof scope[property] !== 'function') {
          return new logError(`SixthJs: ${property} is not a function.`)
        }

        element.addEventListener('click', () => scope[property](), false);
      },
      render: () => true
    },
    change: {
      init: function(element, scope, property) {
        if (typeof scope[property] !== 'function') {
          return new logError(`SixthJs: ${property} is not a function.`)
        }

        element.addEventListener('change', () => scope[property](), false);
      },
      render: () => true
    },
    if: {
      init: function(element, scope, property, stopRegister) {
        element.initHtml = element.innerHTML;

        (!stopRegister)&&this.registerElement(element, property, 'if')
      },
      render: function(element, value) {
        //console.log('render if', value)
        if (value&& !element.innerHTML) {
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
      init: function(element, scope, property) {
        if (!Array.isArray(scope[property])) {
          return new logError(`SixthJs: Property [${property}] must be an Array.`)
        }

        if (!element.bindingTypes.alias) {
          return;
        }

        let copy = utils.copyObj(element.bindingTypes);
        let parent = element.parentNode;
        let comments = {
          start: document.createComment(REPEAT.START),
          stop: document.createComment(REPEAT.STOP)
        }

        element.helpers = comments;
        parent.insertBefore(comments.start, element);
        parent.insertBefore(comments.stop, element);

        delete copy.repeat;

        //TODO: Stringify the object
        element.setAttribute(BIND_ATTR, JSON.stringify(copy));

        this.registerElement(element, property, 'repeat');

        scope[property] = new Proxy(scope[property], {
          set: (model, property, value) => {
            model[property] = value

            if (property === 'length') {
              BINDING_TYPES.repeat.render.call(this, element, model);
            }

            return true;
          }
        });

        parent.removeChild(element);
      },
      render: function(element, value) {
        let parent = element.helpers.start.parentNode
          , newElements = document.createDocumentFragment()
          , genItem = element.helpers.start.nextSibling;

        while (genItem && (genItem.nodeValue !== REPEAT.STOP)) {
          genItem = genItem.nextSibling
          genItem.previousSibling.remove()
        }

        value.forEach((item, index) => {
          let clone = element.cloneNode(true)
            , children = utils.getdomElemens(clone);

          for (let i in children) {
            let node = children[i]
              , data;

            if (node.tagName) {
              data = parseAttrData(node.getAttribute(BIND_ATTR));

              for (let type in data) {

                if (data[type] === element.bindingTypes.alias) {
                  BINDING_TYPES[type].init.call(this, node, value, index, true);
                  BINDING_TYPES[type].render.call(this, node, item);
                } else {
                  BINDING_TYPES[type].init.call(this, node, this.scope, data[type]);
                  BINDING_TYPES[type].render.call(this, node, this.scope[data[type]]);
                }
              }
            }
          }

          newElements.appendChild(clone);
        });

        parent.insertBefore(newElements, element.helpers.stop);
      }
    },
    item: {
      init: () => true,
      render: () => true
    },
    view: {
      init: () => true,
      render: () => true
    },
  };

  let utils = {
    isUndefined: (value) => typeof value === 'undefined',
    isDefined: (value) => typeof value !== 'undefined',
    getdomElemens: (domElement) => {
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
    constructor() {
    }

    getModel() {
      return Object.keys(this)
        .reduce((mappedData, key) => {
          mappedData[key] = {};

          return mappedData
        }, {});
    }
  }
  ;

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
      this.scope = new Proxy(new Scope(), {
        set: (model, property, value) => {

          let oldValue = model[property];
          if (oldValue === value) {
            return true;
          }


          model[property] = value;

          RENDER_TYPES.forEach((type) => this.render(type, property, value));

          return true;
        }
      });

      this.callback.call(this.scope);
      this.modelView = this.scope.getModel();
    }

  ;

    registerElement(element, property, type) {
      !element.isRegistered&&this.modelView[property][type]
        ? this.modelView[property][type].push(element)
        : this.modelView[property][type] = [element];
    }

    render(type, property, value) {
      if (!this.modelView|| !this.modelView[property][type]) {
        return;
      }

      this.modelView[property][type].forEach((element) => {
        if (element.isTouched) {
          return element.isTouched = false;
        }

        BINDING_TYPES[type].render.call(this, element, value);
      })
    }

  ;

    /**
     * Sort each element with data-model attribut to it model in scope
     * @returns {*}
     */
    bindElements(elements) {
      for (let i = 0, length = elements.length; i < length; i++) {
        let element = elements[i];

        if (!element.tagName) {
          return;
        }

        let data = parseAttrData(element.getAttribute(BIND_ATTR));
        element.bindingTypes = data;

        for (let type in data) {
          if (!this.modelView.hasOwnProperty(data[type])) {
            return;
          }

          if (!BINDING_TYPES.hasOwnProperty(type)) {
            return new logError('Invalid binding type in: ' + type)
          }

          // element.isRegistered = true;
          BINDING_TYPES[type].init.call(this, element, this.scope, data[type]);
          BINDING_TYPES[type].render.call(this, element, this.scope[data[type]]);
        }
      }
    }

  ;
  }
  ;

  self.controller = function(name, callback) {
    let ctrl = new Controller(name, callback);

    let elements = utils.getdomElemens(ctrl.ctrlElement);

    ctrl.bindModel();

    ctrl.bindElements(elements);

    console.log('ctrl', ctrl)
  }

})(window, document)