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

;

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
