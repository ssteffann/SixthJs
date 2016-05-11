(function(window, document) {
  /**
   * Constants
   * @type {string}
   */
  const TEXT_NODE = 3;
  const BIND_ATTR = 'data-bind';
  const DATA_VIEW = 'data-view';
  const CTRL_ATTR = 'data-controller';

  const REPEAT = {
    START: 'data-repeat-start',
    STOP: 'data-repeat-stop'
  };

  const EXCLUDED_TYPES = { class: true, include: true };
  const RENDER_TYPES = ['class', 'model', 'attr', 'text', 'if'];

  const SPACE_REG = /\s/g;
  const DEFAULT_ROOT = '/';
  const HASH_REGEXP =/#(.*)$/;
  const PARAMETER_REGEXP = /([:*])(\w+)/g;
  const REPLACE_VARIABLE_REGEXP = '([^\/]*)';
  const INTERPOLATE = /\{\{([\s\S]+?)\}\}/g;
  /** ***************************************************************** **/

  /**
   * Utils
   */
  let utils = {
    objectPath: function(obj, path, value) {
      if (typeof path == 'string') {
        return this.objectPath(obj, path.split('.'), value);
      }

      if (!obj|| !obj.hasOwnProperty(path[0])) {
        return;
      }

      if (path.length == 1&&this.isDefined(value)) {
        return obj[path[0]] = value;
      }

      if (path.length == 1) {
        return obj[path[0]];
      }

      return this.objectPath(obj[path[0]], path.slice(1), value);
    },

    forEachNode: (elem, fn) => {
      if (!elem|| !fn) {
        return;
      }

      for (let i = 0, lgth = elem.length; i < lgth; i++) {
        fn(elem[i], i);
      }
    },
    isUndefined: (value) => typeof value === 'undefined',
    isDefined: (value) => typeof value !== 'undefined',
    getdomElemens: (domElement) => {
      return domElement
        ? domElement.querySelectorAll(`*`)
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
        let json = attrValue
          .replace(/\s+/g, '')
          .replace(/[.\w\d\/>-]+/g, '"$&"');

        return JSON.parse(json);
      } catch (err) {

        new logError('Invalid syntax in binding: ' + attrValue)
      }
    }
  };

  let Binding_Types = {
    model: {
      init: function(element, property, stopRegister) {
        let setValue
          , eventsTypes
          , event;

        if (utils.isUndefined(element.value)) {
          return new logError(`SixthJs: Bind type model can't be applied on this element`);
        }

        (!stopRegister) && this.registerElement(element, property, 'model');
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
        this.customBind(property);

      },
      render: function(obj, value) {
        obj.elem.textContent = obj.fn.call(this.scope, value);
      }
    },
    attr: {
      init: function(element, property, stopRegister) {
        (!stopRegister) && this.registerElement(element, property, 'attr');
        this.customBind(property);

      },
      render: function(obj, value) {
        obj.elem.setAttribute(obj.name, obj.fn.call(this.scope, value))
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

        value.forEach((item) => {
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

  /**
   * Routing service
   */
  class Router {
    constructor(fn) {
      this.handler = fn;
      this.routes = [];
      this.root = DEFAULT_ROOT;
      this.html5Mode = false;
      this.default = {};

      window.addEventListener('hashchange', () => this.check());
    }

    config(options = {}) {
      this.html5Mode = !!options.html5Mode;
      this.root = options.root
        ? `/${this.clearSlashes(options.root)}/`
        : DEFAULT_ROOT;

      if (this.html5Mode) {
        window.addEventListener('popstate', this.check);

        window.removeEventListener('hashchange', this.check)
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

    check(current = this.getCurrent()) {
      let routeParams = {}
        , keys;

      this.routes.forEach((state) => {
        keys = state.url.match(PARAMETER_REGEXP);

        let match = current
          .match(new RegExp(state.url.replace(PARAMETER_REGEXP, REPLACE_VARIABLE_REGEXP)));

        if (match) {
          match.shift();

          match.forEach(function(value, i) {
            routeParams[keys[i].replace(':', '')] = value;
          });

          this.handler(state, routeParams);

          return this;
        }
      });

      return this;
    }

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

    flush() {
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

  /**
   * Template Engine
   */
  class TemplateEngine {
    constructor(http, bootstrapper) {
      this.http = http;
      this.bootstrapper = bootstrapper;
    }

    getTemplate(url) {
      return this.http.get({url: url, cache: true});
    }

    escapeHtml(html = '') {
      let entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
      };

      return html.toString().replace(/[&<>"'`=\/]/g, (s) => entityMap[s]||s)
    }

    unescape(html = '') {
      return html
        .replace(/\\('|\\)/g, "$1")
        .replace(/[\r\t\n]/g, '');
    }

    registerTemplate(ctrlName, parrent, html, include) {
      let div = document.createElement('div')
        , fragment = document.createDocumentFragment();

      div.innerHTML = html;
      parrent.innerHTML = '';

      fragment.appendChild(div);

      include
        ? this.bootstrapper.registerInclude(ctrlName, fragment)
        : this.bootstrapper.registerElement(ctrlName, fragment);

      parrent.appendChild(fragment);
    }

    compile(tmpl = '', arg = '') {
      let str = tmpl
        , preComp;

      preComp = str
        .replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, ' ')
        .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, '')
        .replace(/'|\\/g, "\\$&")
        .replace(INTERPOLATE, (m, code) => {
          let sp = arg ? '' : 'this.';

          return `';out+=(${sp}${this.unescape(code)});out+='`;
        });

      str = (`let out = '${preComp}';return out;`);

      console.log('string', str)
      str.replace(/\n/g, "\\n")
        .replace(/\t/g, '\\t')
        .replace(/\r/g, "\\r")
        .replace(/(\s|;|\}|^|\{)out\+='';/g, '$1')
        .replace(/\+''/g, "");

      try {
        return new Function(arg,str);
      } catch (e) {
        console.log("Could not create a template function: " + str)
      }
    }
  }

  /**
   * Http Service
   */
  class Http {
    constructor(){
      this.cachedData = new Map();
    }

    init(method) {
      return (options) => new Promise((resolve, reject) => {
        let request = new XMLHttpRequest()
          , that = this
          , {url, params, headers, cache} = options;

        if (cache && that.cachedData.has(url)) return resolve(this.cachedData.get(url));

        request.open(method, url);

        request.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            cache && that.cachedData.set(url, request.response);

            return resolve(request.response);
          }
          return reject({
            status: this.status,
            data: request.statusText
          });
        };

        request.onerror = function () {
          return reject({
            status: this.status,
            data: request.statusText
          });
        };

        if (headers && typeof headers === 'object') {
          Object.keys(headers)
            .forEach((key) => request.setRequestHeader(key, headers[key]));
        }

        if (params && typeof params === 'object') {
          params = Object.keys(params)
            .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
            .join('&');
        }

        request.send(params);
      })
    }
  }

  /**
   * Bootstrapper
   */
  class Bootstrapper {
    constructor(utils) {
      this.utils = utils;
      this.ctrlMap = new Map();
      this.ctrlElemMap = new Map();

      this.registerCtrlElements();
    }

    registerCtrlElements(doc) {
      let ctrl = (doc || document).querySelectorAll(`[${CTRL_ATTR}]`);

      this.utils.forEachNode(ctrl, (elem) => {
        let name = elem.getAttribute(CTRL_ATTR);

        if (!name) return;

        this.ctrlElemMap.set(name, elem);

        this.build(name);
      });
    }

    registerElement(name, elem) {
      this.ctrlElemMap.set(name, elem);

      this.build(name);

      this.registerCtrlElements(elem);
    }

    registerInclude(name, elem){
      this.build(name, elem);

      this.registerCtrlElements(elem);
    }

    registerCtrl(name, ctrl) {
      this.ctrlMap.set(name, ctrl);

      this.build(name);
    }

    build(ctrlName, elem) {
      let ctrl = this.ctrlMap.get(ctrlName)
        , ctrlEelem = elem || this.ctrlElemMap.get(ctrlName)
        , elements;

      if (!ctrl || !ctrlEelem) return;

      elements = this.utils.getdomElemens(ctrlEelem);

      if (!elem) {
        ctrl.clear();
        ctrl.bindModel();
      }

      ctrl.bindElements(elements);

      console.log('binded ctrl', ctrl)
    }

    clearElements() {
      this.ctrlElemMap.clear();
    }
  }

  /**
   * Scope
   */
  class Scope {
    setToPath(path, value) {
      utils.objectPath(this, path, value);
    }

    getFromPath(path) {
      return utils.objectPath(this, path)
    }
  }

  /**
   * Service
   */

  class Service {
    constructor(){
      this.services = new Map();
    }

    register(name, fn){
      this.services.set(name, new fn())
    }

    get(name){
      return this.services.get(name)
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
      };

      utils.forEachNode(elements, (element) => {
        let attr = element.getAttribute(BIND_ATTR)
          , data;

        if (element.hasAttributes()) {
          utils.forEachNode(element.attributes, (attr) => {

            matchText(element, 'attr', attr.value, item, alias, attr.name);
          });
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

  let $http = new Http();

  self.$http = {
    'get': $http.init('GET'),
    'post': $http.init('POST'),
    'put': $http.init('PUT'),
    'delete': $http.init('DELETE'),
    'options': $http.init('OPTIONS'),
    'head': $http.init('HEAD')
  };

  let bootstrapper = new Bootstrapper(utils);
  let tmplEngine = new TemplateEngine(self.$http, bootstrapper);
  let service = new Service();

  self.route = new Router((state, params) => {
    let element = document.querySelector(`[${DATA_VIEW}]`)

    tmplEngine.getTemplate(state.templateUrl)
      .then((response) => tmplEngine.registerTemplate(state.controller, element, response))
      .catch((error) => { throw error; });
  });

  self.controller = function(name, callback) {
    bootstrapper.registerCtrl(name, new Controller(name, callback));

    return this;
  };

  self.service = function(name, fn) {
    service.register(name, fn);

    return this;
  };

  self.inject = function(name) {
    return service.get(name);
  };


})(window, document);