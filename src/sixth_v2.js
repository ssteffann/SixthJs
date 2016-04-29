(function(window, document) {
  /**
   * Constants
   * @type {string}
   */

  const MODEL_ATTR = 'data-model';
  const BIND_ATTR = 'data-bind';
  const DATA_VIEW = 'data-view';
  const REPEAT = {
    START: 'data-repeat-start',
    STOP: 'data-repeat-stop'
  }
  const RENDER_TYPES = ['model', 'text', 'if'];






  /** ***************************************************************** **/

  let Binding_Types = {
    model: {
      init: function(element, scope, property, stopRegister) {
        let setValue
          , eventsTypes
          , event;

        if (utils.isUndefined(element.value)) {
          return new logError(`SixthJs: Bind type model can't be applied on this element`);
        }

        (!stopRegister) && this.registerElement(element, property, 'model')
        this.customBind(property);

        setValue = (event) => {
          element.isTouched = true;
          scope.setToPath(property, event.target.value);
        };

        eventsTypes = {
          'checkbox': () => ({
            name: 'change',
            fn: (event) => {
              element.isTouched = true;
              scope.setToPath(property, event.target.checked);
            }
          }),
          'radio': () => ({
            name: 'change',
            fn: setValue
          })
        };

        event = eventsTypes.hasOwnProperty(element.type)
          ? eventsTypes[element.type]()
          : { name: 'input', fn: setValue };

        element.addEventListener(event.name, event.fn, false);
      },
      render: function(element, value) {
        let elementsType = {
          checkbox: (element, value) => element.checked = !!value,
          radio: (element, value) => {
            if (element.value === value && !element.checked) {
              element.checked = true;
            }
          }
        };

        elementsType.hasOwnProperty(element.type)
          ? elementsType[element.type](element, value)
          : element.value = value;
      }
    },
    text: {
      init: function(element, scope, property, stopRegister) {
        console.log('init',property, element);
        (!stopRegister) && this.registerElement(element, property, 'text');

        //this.customBind(property)
      },
      render: function(obj, value) {
        //console.log('render text')

        obj.elem.textContent = obj.fn.call(this.scope);
      }
    },
    click: {
      init: function(element, scope, property) {
        let fn = scope.getFromPath(property);

        if (typeof fn !== 'function') {
          return new logError(`SixthJs: ${property} is not a function.`)
        }

        element.addEventListener('click',() => fn.call(scope), false);
      },
      render: () => true
    },
    dblclick: {
      init: function(element, scope, property) {
        let fn = scope.getFromPath(property);

        if (typeof fn !== 'function') {
          return new logError(`SixthJs: ${property} is not a function.`)
        }

        element.addEventListener('dblclick',() => fn.call(scope), false);
      },
      render: () => true
    },
    change: {
      init: function(element, scope, property) {
        let fn = scope.getFromPath(property);

        if (typeof fn !== 'function') {
          return new logError(`SixthJs: ${property} is not a function.`)
        }

        element.addEventListener('change', () => fn.call(scope), false);
      },
      render: () => true
    },
    class: {

    },
    if: {
      init: function(element, scope, property, stopRegister) {
        element.initHtml = element.innerHTML;

        (!stopRegister) && this.registerElement(element, property, 'if')
      },
      render: function(element, value) {
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
        let arr = scope.getFromPath(property);

        if (!Array.isArray(arr)) {
          return new logError(`SixthJs: Property [${property}] must be an Array.`)
        }

        if (!element.$bindingTypes.alias)  return;

        let copy = utils.copyObj(element.$bindingTypes);
        let parent = element.parentNode;
        let comments = {
          start: document.createComment(REPEAT.START),
          stop: document.createComment(REPEAT.STOP)
        };

        element.helpers = comments;
        parent.insertBefore(comments.start, element);
        parent.insertBefore(comments.stop, element);

        delete copy.repeat;

        //TODO: Stringify the object
        element.setAttribute(BIND_ATTR, JSON.stringify(copy));

        this.registerElement(element, property, 'repeat');

        let watcher = new Proxy(arr, {
          set: (model, property, value) => {
            model[property] = value

            if (property === 'length') {
              Binding_Types.repeat.render.call(this, element, model);
            }

            return true;
          }
        });
        scope.setToPath(property, watcher);

        parent.removeChild(element);
      },
      render: function(element, value) {
        let parent = element.helpers.start.parentNode
          , newElements = document.createDocumentFragment()
          , genItem = element.helpers.start.nextSibling;

        while (genItem && (genItem.nodeValue !== REPEAT.STOP)) {
          genItem = genItem.nextSibling;
          genItem.previousSibling.remove()
        }

        value.forEach((item, index) => {
          let clone = element.cloneNode(true)
            , children = utils.getdomElemens(clone);

          utils.forEachNode(children, (node) => {
            let data;

            if (!node.tagName) return;

            data = utils.parseAttrData(node.getAttribute(BIND_ATTR));

            for (let type in data) {

              if (data[type] === element.$bindingTypes.alias) {
                Binding_Types[type].init.call(this, node, value, index, true);
                Binding_Types[type].render.call(this, node, item);
              } else {
                Binding_Types[type].init.call(this, node, this.scope, data[type]);
                Binding_Types[type].render.call(this, node, this.scope.getFromPath(data[type]));
              }
            }
          });

          newElements.appendChild(clone);
        });

        parent.insertBefore(newElements, element.helpers.stop);
      }
    },
    item: {
      init: () => true,
      render: () => true
    },
    include: {
      init: function(element, scope, url) {

        tmplEngine.getTemplate(url)
          .then((response) => {
            tmplEngine.registerTemplate(this.ctrlName, element, response, true)
          })
          .catch((error) => {
            throw new Error(error);
          });
      },
      render: () => true
    },
    view: {
      init: () => true,
      render: () => true
    }
  };

  let self = {};

  window.sixth = self;

  class logError {
    constructor(message) {
      throw new Error(message)
    }
  }

  class Scope {
    setToPath(path, value) {
      utils.objectPath(this, path, value);
    }

    getFromPath(path) {
      return utils.objectPath(this, path)
    }
  }

  /**
   * Controller class that bind model and view
   */
  class Controller {
    constructor(name, callback) {
      this.ctrlName = name;
      this.callback = callback;
      this.modelView = {};
      this.proxies = new Map();
    }

    clear(){
      this.modelView = {};
      this.proxies.clear();
    }

    customBind(property) {
      let obj
        , proxy
        , parrent;

      if(typeof property !== 'string') return;

      parrent = property.substr(0, property.lastIndexOf('.')) || false;

      if (!parrent || this.proxies.has(parrent)) return;

      obj = this.scope.getFromPath(parrent);

      if (typeof obj !== 'object' || Array.isArray(obj)) return;

      this.proxies.set(parrent, 'registered');

      proxy = new Proxy(obj, {
        set: (model, prop, value) => {
          let oldValue = model[prop];

          if (oldValue === value) {
            return false;
          }

          model[prop] = value

          RENDER_TYPES.forEach((type) => this.render(type, `${parrent}.${prop}`, value));

          return true;
        }
      });

      return new Function('proxy', `this.scope.${parrent} = proxy;`)
        .call(this, proxy);
    }

    bindModel() {
      this.scope = new Proxy(new Scope(), {
        set: (model, property, value) => {
          let oldValue = model[property];
          if (oldValue === value) return true;

          model[property] = value;

          RENDER_TYPES.forEach((type) => this.render(type, property, value));

          return true;
        }
      });

      this.callback.call(this.scope);
    };

    registerElement(element, property, type) {
      this.modelView[property][type]
        ? this.modelView[property][type].push(element)
        : this.modelView[property][type] = [element];
    };

    render(type, property, value) {
      if (!this.modelView[property] || !this.modelView[property][type]) {
        return;
      }

      this.modelView[property][type].forEach((element) => {
        if (element.isTouched) {
          return element.isTouched = false;
        }

        Binding_Types[type].render.call(this, element, value);
      })
    };

    /**
     * Sort each element with data-model attribut to it model in scope
     * @returns {*}
     */
    bindElements(elements) {
      utils.forEachNode(elements, (element) => {
        let attr = element.getAttribute(BIND_ATTR)
          , data;

        utils.forEachNode(element.childNodes, (child) => {
          let match;

          if (child.nodeType !== 3) return;

          while (match = INTERPOLATE.exec(child.textContent)) {
            let prop = match[1].replace(/\s/g, '')
              , obj = { elem: child, fn: tmplEngine.compile(child.textContent) };

            if (!this.modelView.hasOwnProperty(prop)) {
              this.modelView[prop] = {};
            }

            Binding_Types.text.init.call(this, obj, this.scope, prop);
            Binding_Types.text.render.call(this, obj);
          }
        });

        if (!attr)  return;

        data = utils.parseAttrData(attr);
        element.$bindingTypes = data;

        Object.keys(data).forEach((type) => {
          let value = this.scope.getFromPath(data[type]);

          if (type !== 'include' && utils.isUndefined(value)) return;

          if (type !== 'include'&& !this.modelView.hasOwnProperty(data[type])) {
            this.modelView[data[type]] = {};
          }

          if (!Binding_Types.hasOwnProperty(type)) {
            return new logError('Invalid binding type in: ' + type)
          }

          Binding_Types[type].init.call(this, element, this.scope, data[type]);
          Binding_Types[type].render.call(this, element, value);
        });
      });
    }
  }

  let bootstrapper = new Bootstrapper();
  let tmplEngine = new TemplateEngine(http, bootstrapper);

  self.route = new Router((state, params) => {
    let element = document.querySelector(`[${DATA_VIEW}]`)

    tmplEngine.getTemplate(state.templateUrl)
      .then((response) => tmplEngine.registerTemplate(state.controller, element, response))
      .catch((error) => {
        throw new Error(error);
      });
  });

  self.$http = {
    'get': (url, params, headers) => http({ method: 'GET', url: url, params: params, headers: headers }),
    'post': (url, params, headers) => http({ method: 'POST', url: url, params: params, headers: headers }),
    'put': (url, params, headers) => http({ method: 'PUT', url: url, params: params, headers: headers }),
    'delete': (url, params, headers) => http({ method: 'DELETE', url: url, params: params, headers: headers }),
    'options': (url, params, headers) => http({ method: 'OPTIONS', url: url, params: params, headers: headers }),
    'head': (url, params, headers) => http({ method: 'HEAD', url: url, params: params, headers: headers }),
  };



  /** ***************************************************************** **/

  self.controller = function(name, callback) {
    bootstrapper.registerCtrl(name, new Controller(name, callback));

    return this;
  }

})(window, document)