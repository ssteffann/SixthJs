(function(window, document) {
  /**
   * Constants
   * @type {string}
   */
  const TEXT_NODE = 3;
  const BIND_ATTR = 'data-bind';
  const DATA_VIEW = 'data-view';
  const REPEAT = {
    START: 'data-repeat-start',
    STOP: 'data-repeat-stop'
  };

  const EXCLUDED_TYPES = { class: true, include: true };
  const RENDER_TYPES = ['class', 'model', 'attr', 'text', 'if'];
  const CTRL_ATTR = 'data-controller';

  const SPACE_REG = /\s/g;

  /** ***************************************************************** **/

  let Binding_Types = {
    model: {
      init: function(element, property, stopRegister) {
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
          this.scope.setToPath(property, event.target.value);
        };

        eventsTypes = {
          'checkbox': () => ({
            name: 'change',
            fn: (event) => {
              element.isTouched = true;
              this.scope.setToPath(property, event.target.checked);
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
      init: function(element, property, stopRegister) {
        (!stopRegister) && this.registerElement(element, property, 'text');

      },
      render: function(obj, value) {
        obj.elem.textContent = obj.fn.call(this.scope, value);
      }
    },
    attr: {
      init: function(element, property, stopRegister) {
        (!stopRegister) && this.registerElement(element, property, 'attr');
      },
      render: function(obj, value) {
        obj.elem.setAttribute(obj.name, obj.fn.call(this.scope))
      }
    },
    click: {
      init: function(element, property) {
        let fn = this.scope.getFromPath(property);

        if (typeof fn !== 'function') {
          return new logError(`SixthJs: ${property} is not a function.`)
        }

        element.addEventListener('click',() => fn.call(this.scope), false);
      },
      render: () => true
    },
    dblclick: {
      init: function(element, property) {
        let fn = this.scope.getFromPath(property);

        if (typeof fn !== 'function') {
          return new logError(`SixthJs: ${property} is not a function.`)
        }

        element.addEventListener('dblclick',() => fn.call(this.scope), false);
      },
      render: () => true
    },
    change: {
      init: function(element, property) {
        let fn = this.scope.getFromPath(property);

        if (typeof fn !== 'function') {
          return new logError(`SixthJs: ${property} is not a function.`)
        }

        element.addEventListener('change', () => fn.call(this.scope), false);
      },
      render: () => true
    },
    class: {
      init: function(element, property, stopRegister) {
        element.$class  = !element.$class ? new Map() : element.$class;

        for (let key in property) {
          let value = property[key];

          element.$class.set(value, key);

          (!stopRegister) && this.registerElement(element, value, 'class');
          this.customBind(value);

          Binding_Types.class.render(element, this.scope.getFromPath(value), value);
        }
      },
      render: function(element, value, property) {
        let $class =  element.$class.get(property);

        value
            ? element.classList.add($class)
            : element.classList.remove($class);
      }
    },
    if: {
      init: function(element, property, stopRegister) {
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
    alias: {
      init: () => true,
      render: () => true
    },
    repeat: {
      init: function(element, property) {
        let arr = this.scope.getFromPath(property)
          , copy
          , parent
          , comments;

        if (!Array.isArray(arr)) {
          return new logError(`SixthJs: Property [${property}] must be an Array.`)
        }

        if (!element.$bindingTypes.alias)  return;

        copy = utils.copyObj(element.$bindingTypes);
        parent = element.parentNode;
        comments = {
          start: document.createComment(REPEAT.START),
          stop: document.createComment(REPEAT.STOP)
        };

        element.helpers = comments;
        parent.insertBefore(comments.start, element);
        parent.insertBefore(comments.stop, element);

        delete copy.repeat;
        delete copy.alias;

        element.setAttribute(BIND_ATTR, JSON.stringify(copy));

        this.registerElement(element, property, 'repeat');

        let watcher = new Proxy(arr, {
          set: (model, property, value) => {
            model[property] = value;

            if (property === 'length') {
              Binding_Types.repeat.render.call(this, element, model);
            }

            return true;
          }
        });
        this.scope.setToPath(property, watcher);

        parent.removeChild(element);
      },
      render: function(element, value) {
        let parent = element.helpers.start.parentNode
          , alias = element.$bindingTypes.alias
          , newElement = document.createDocumentFragment()
          , genItem = element.helpers.start.nextSibling;

        while (genItem && (genItem.nodeValue !== REPEAT.STOP)) {
          genItem = genItem.nextSibling;
          genItem.previousSibling.remove()
        }

        value.forEach((item, index) => {
          let clone = element.cloneNode(true)
            , children = utils.getdomElemens(clone);

          children = children.length ? children : [clone];

          this.bindElements(children, item, alias);

          newElement.appendChild(clone);
        });

        parent.insertBefore(newElement, element.helpers.stop);
      }
    },
    include: {
      init: function(element, url) {
        tmplEngine.getTemplate(url)
          .then((response) => {
            tmplEngine.registerTemplate(this.ctrlName, element, response, true)
          })
          .catch((error) => {
            throw new Error(error);
          });
      },
      render: () => true
    }
  };

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

          if (oldValue === value) return false;

          model[prop] = value;
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
      if(!this.modelView.hasOwnProperty(property)) {
        this.modelView[property] = {};
      }

      this.modelView[property][type]
        ? this.modelView[property][type].push(element)
        : this.modelView[property][type] = [element];
    };

    render(type, property, value) {
      if (!this.modelView[property] || !this.modelView[property][type]) return;

      this.modelView[property][type].forEach((element) => {
        if (element.isTouched) {
          return element.isTouched = false;
        }

        Binding_Types[type].render.call(this, element, value, property);
      })
    };

    /**
     * Sort each element with data-model attribut to it model in scope
     * @returns {*}
     */
    bindElements(elements, item, alias) {
      let init = (element, property, type, item = null) => {
        let value = item || this.scope.getFromPath(property);

        if (!EXCLUDED_TYPES[type] && utils.isUndefined(value)) return false;

        Binding_Types[type].init.call(this, element, property, item);
        !EXCLUDED_TYPES[type] && Binding_Types[type].render.call(this, element, value);

        return true;
      };

      let matchText = (elem, type, text, item = null, alias = null, name = null) => {
        let match = INTERPOLATE.exec(text)
          , prop
          , obj;

        if (!match) return;

        prop = match[1].replace(SPACE_REG, '');

        obj = {
          name: name,
          elem: elem,
          fn: tmplEngine.compile(text, prop.includes(alias) ? alias : undefined)
        };

        while (match = INTERPOLATE.exec(text)) {
          if(!init(obj, match[1].replace(SPACE_REG, ''), type, item)) return;
        }
      }

      utils.forEachNode(elements, (element) => {
        let attr = element.getAttribute(BIND_ATTR)
          , data;

        if (element.hasAttributes()) {
          utils.forEachNode(element.attributes, (attr) =>
            matchText(element, 'attr', attr.value, item, alias, attr.name))
        }

        utils.forEachNode(element.childNodes, (child) => {
          if (child.nodeType !== TEXT_NODE) return;

          matchText(child, 'text', child.textContent, item, alias)
        });

        if (!attr) return;

        data = utils.parseAttrData(attr);
        element.$bindingTypes = data;

        Object.keys(data).forEach((type) => {
          if (!Binding_Types.hasOwnProperty(type)) {
            return new logError('Invalid binding type in: ' + type)
          }

          init(element, data[type], type)
        });
      });
    }
  }


  /** ***************************************************************** **/
  let self = {};

  window.sixth = self;

  let bootstrapper = new Bootstrapper();
  let tmplEngine = new TemplateEngine(http, bootstrapper);

  self.route = new Router((state, params) => {
    let element = document.querySelector(`[${DATA_VIEW}]`)

    tmplEngine.getTemplate(state.templateUrl)
      .then((response) => tmplEngine.registerTemplate(state.controller, element, response))
      .catch((error) => { throw error; });
  });

  self.$http = {
    'get': (url, params, headers) => http({ method: 'GET', url: url, params: params, headers: headers }),
    'post': (url, params, headers) => http({ method: 'POST', url: url, params: params, headers: headers }),
    'put': (url, params, headers) => http({ method: 'PUT', url: url, params: params, headers: headers }),
    'delete': (url, params, headers) => http({ method: 'DELETE', url: url, params: params, headers: headers }),
    'options': (url, params, headers) => http({ method: 'OPTIONS', url: url, params: params, headers: headers }),
    'head': (url, params, headers) => http({ method: 'HEAD', url: url, params: params, headers: headers }),
  };

  self.controller = function(name, callback) {
    bootstrapper.registerCtrl(name, new Controller(name, callback));

    return this;
  }

})(window, document)