{

  class Route {
    construtor() {
      this.routes = [];
      this.root = '/';
      this.html5Mode = false;
      this.default = {};

      window.addEventListener('popstate', (event) => {
        console.log('event', event);
      });

      window.addEventListener('hashchange', () => {
        console.log('event', event);

      });
    };

    config(options = {}) {
      this.html5Mode = !!options.html5Mode;
      this.root = options.root
        ? `/${this.clearSlashes(options.root)}/`
        : '/';

      return this;
    }

    clearSlases(path) {
      return path.toString()
        .replace(/\/$/, '')
        .replace(/^\//, '');
    }

    register(state = {}) {
      this.routes.push(state);

      return this;
    }

    default(state = {}){
      this.default = state;

      return this;
    }

  }


  //TODO Look on this address
  // http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url

  sixth.route = route;
}