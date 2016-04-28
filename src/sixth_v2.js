(function(window, document) {
  /**
   * Constants
   * @type {string}
   */
  const CTRL_ATTR = 'data-controller';
  const MODEL_ATTR = 'data-model';
  const BIND_ATTR = 'data-bind';
  const DATA_VIEW = 'data-view';
  const REPEAT = {
    START: 'data-repeat-start',
    STOP: 'data-repeat-stop'
  }
  const RENDER_TYPES = ['model', 'text', 'if'];

  const DEFAULT_ROOT = '/';
  const PARAMETER_REGEXP = /([:*])(\w+)/g;
  const REPLACE_VARIABLE_REGEXP = '([^\/]*)';
  const HASH_REGEXP =/#(.*)$/;

  /** ***************************************************************** **/

  let self = {}
    , Binding_Types
    , http
    , utils;

  window.sixth = self;

  utils = {
    objectPath: function (obj, path, value) {
      if (typeof path == 'string') return this.objectPath(obj, path.split('.'), value);

      if (!obj || !obj.hasOwnProperty(path[0])) return;

      if (path.length == 1 && this.isDefined(value)) return obj[path[0]] = value;

      if (path.length == 1) return obj[path[0]];

      return this.objectPath(obj[path[0]], path.slice(1), value);
    },

    forEachNode: (elem, fn) => {
      if(!elem) return;

      for (let i=0, lgth = elem.length; i < lgth; i++) {
        if (elem[i].tagName) {
          fn(elem[i], i);
        }
      }
    },
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
    },
    parseAttrData: (attrValue) => {
      try {
        let json = attrValue.replace(/[.\w\d\/-]+/g, '"$&"');

        return JSON.parse(json);
      } catch (err) {
        new logError('Invalid syntax in binding: ' + attrValue)
      }
    }
  };

  http = function(options, cache) {
    return new Promise((resolve, reject) => {
      if(cache) return resolve(cache);

      let request = new XMLHttpRequest()
        , { method, url, params, headers} = options;

      request.open(method, url);

      request.onload = function() {
        if (this.status >= 200&&this.status < 300) {
          return resolve(request.response);
        }
        return reject({
          status: this.status,
          data: request.statusText
        });
      };

      request.onerror = function() {
        return reject({
          status: this.status,
          data: request.statusText
        });
      };

      if (headers && typeof headers === 'object') {
        Object.keys(headers)
          .forEach((key) => request.setRequestHeader(key, headers[key]));
      }

      if (params && typeof headers === 'object') {
        params = Object.keys(params)
          .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
          .join('&');
      }

      request.send(params);
    });
  };

  class logError {
    constructor(message) {
      throw new Error(message)
    }
  }

  class Html {
    constructor(http, bootstrapper) {
      this.http = http;
      this.bootstrapper = bootstrapper;
      this.templateCache = new Map();
    }

    getTemplate(url) {
      return this.http({ method: 'GET', url: url }, this.templateCache.get(url))
        .then((html) => {
          if (!this.templateCache.has(url)) {
            this.templateCache.set(url, html)
          };

          return html;
        })
    }

    registerTemplate(ctrlName, parrent, html){
      let div = document.createElement('div')
        , fragment = document.createDocumentFragment();

      div.innerHTML = html;
      parrent.innerHTML = '';

      fragment.appendChild(div);

      this.bootstrapper.registerElement(ctrlName, fragment);

      parrent.appendChild(fragment);
    }
  }

  class Bootsrapper {
    constructor() {
      this.ctrlMap = new Map();
      this.ctrlElemMap = new Map();

      this.registerCtrlElements();
    }

    registerCtrlElements(doc) {
      let ctrl = (doc || document).querySelectorAll(`[${CTRL_ATTR}]`);

      utils.forEachNode(ctrl, (elem) => {
        let name = elem.getAttribute(CTRL_ATTR);

        this.ctrlElemMap.set(name, elem);

        this.build(name);
      });
    };

    registerElement(name, elem) {
      this.ctrlElemMap.set(name, elem);

      this.build(name);

      this.registerCtrlElements(elem);
    }

    registerCtrl(name, ctrl) {
      this.ctrlMap.set(name, ctrl);

      this.build(name);
    };

    build(ctrlName) {
      let ctrl = this.ctrlMap.get(ctrlName)
        , ctrlEelem = this.ctrlElemMap.get(ctrlName)
        , elements;

      if(!ctrl || !ctrlEelem) return;

      elements = utils.getdomElemens(ctrlEelem);

      ctrl.clear();
      ctrl.bindModel();
      ctrl.bindElements(elements);

      console.log('Binded ctrl:', ctrl)
    };

    clearElements() {
      this.ctrlElemMap.clear();
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
          /*          console.log('model', model)
           console.log('property', property)
           console.log('value', value)*/

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
        let data = utils.parseAttrData(element.getAttribute(BIND_ATTR));

        element.$bindingTypes = data;

        Object.keys(data).forEach((type) => {
          let value = this.scope.getFromPath(data[type]);

          if(type !== 'include' && utils.isUndefined(value)) return;

          if (type !== 'include' && !this.modelView.hasOwnProperty(data[type])) {
            this.modelView[data[type]] = {};
          }

          if (!Binding_Types.hasOwnProperty(type)) {
            return new logError('Invalid binding type in: ' + type)
          }

          Binding_Types[type].init.call(this, element, this.scope, data[type]);
          Binding_Types[type].render.call(this, element, value);
        });
      });
    };
  }

  class Router {
    constructor(fn) {
      this.handler = fn;
      this.routes = [];
      this.root = DEFAULT_ROOT;
      this.html5Mode = false;
      this.default = {};

      window.addEventListener('hashchange',() => this.check());
    }

    config(options = {}) {
      this.html5Mode = !!options.html5Mode;
      this.root = options.root
        ? `/${this.clearSlashes(options.root)}/`
        : DEFAULT_ROOT;

      if(this.html5Mode){
        window.addEventListener('popstate', this.check);

        window.removeEventListener('hashchange',  this.check)
      }

      return this;
    }

    clearSlashes(path) {
      return path.toString()
        .replace(/\/$/, '')
        .replace(/^\//, '');
    }

    getCurrent() {
      let current = '';

      if (this.html5Mode) {
        current = this.clearSlashes(decodeURI(`${location.pathname}`))
          .replace(/\?(.*)$/, '');

        current = this.root != DEFAULT_ROOT
          ? current.replace(this.root, '')
          : current;
      } else {
        let match = location.href.match(HASH_REGEXP);
        current = match ? match[1] : '';
      }

      return current;//this.clearSlashes(current);
    }

    check(current = this.getCurrent()){
      let routeParams = {}
        , keys;

      this.routes.forEach((state) => {
        keys = state.url.match(PARAMETER_REGEXP);

        let match = current
          .match(new RegExp(state.url.replace(PARAMETER_REGEXP, REPLACE_VARIABLE_REGEXP)));

        if(match) {
          match.shift();

          match.forEach(function(value, i) {
            routeParams[keys[i].replace(':', '')] = value;
          });

          this.handler(state, routeParams);

          return this;
        }
      });

      return this;
    };

    goTo(path = '') {
      this.html5Mode
        ? history.pushState(null, null, `${this.root}${this.clearSlashes(path)}`)
        : location.href = `${location.href.replace(HASH_REGEXP, '')}#${path}`;

      return this;
    }

    register(state = {}) {
      this.routes.push(state);

      return this;
    }

    deregister(state = {}) {
      let index = this.routes.findIndex((item) => {
        return item.url.toString() === state.url.toString();
      });

      this.routes.splice(index, 1);

      return this;
    }

    flush(){
      this.routes = [];
      this.html5Mode = false;
      this.root = DEFAULT_ROOT;

      return this;
    }

    default(state = {}) {
      this.default = state;

      return this;
    }
  }

  let bootsrapper = new Bootsrapper();
  let tplEngine = new Html(http, bootsrapper);

  self.route = new Router((state, params) => {
    let element = document.querySelector(`[${DATA_VIEW}]`)

    tplEngine.getTemplate(state.templateUrl)
      .then((response) => tplEngine.registerTemplate(state.controller, element, response))
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

  Binding_Types = {
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
        let keys
          , obj
          , proxy;
        //console.log('init');
        (!stopRegister) && this.registerElement(element, property, 'text');

        this.customBind(property)
      },
      render: function(element, value) {
        //console.log('render text')

        element.innerHTML = value;
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

        tplEngine.getTemplate(url)
          .then((response) => {


            let compile = tmplEngine.compile(response);

            console.log('compile', compile);
            let html = compile.call(this.scope);
            console.log('html', html);


            tplEngine.registerTemplate(this.ctrlName, element, response)
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

  /** ***************************************************************** **/

  self.controller = function(name, callback) {
    bootsrapper.registerCtrl(name, new Controller(name, callback));

    return this;
  }

})(window, document)