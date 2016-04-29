const DEFAULT_ROOT = '/';
const HASH_REGEXP =/#(.*)$/;
const PARAMETER_REGEXP = /([:*])(\w+)/g;
const REPLACE_VARIABLE_REGEXP = '([^\/]*)';

const INTERPOLATE = /\{\{([\s\S]+?)\}\}/g;

class TemplateEngine {
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
        }

        return html;
      })
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

    return html.toString().replace(/[&<>"'`=\/]/g, (s) => this.escapeHtml[s]||s)
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

  compile(tmpl = '') {
    let cse = { start: "';out+=(this.", end: ");out+='" }
      , str = tmpl
      , preComp;

    preComp = str
      .replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, ' ')
      .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, '')
      .replace(/'|\\/g, "\\$&")
      .replace(INTERPOLATE, (m, code) => {
        console.log('code', code)

        return `${cse.start}${this.unescape(code)}${cse.end}`;
      });

    str = (`let out = '${preComp}';return out;`);

    str.replace(/\n/g, "\\n")
      .replace(/\t/g, '\\t')
      .replace(/\r/g, "\\r")
      .replace(/(\s|;|\}|^|\{)out\+='';/g, '$1')
      .replace(/\+''/g, "");

    try {
      return new Function(str);
    } catch (e) {
      console.log("Could not create a template function: " + str)
    }
  }
}
