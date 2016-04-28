{
  let self = {};
  window.tmplEngine = self;

  let tmplSettings = {
    evaluate: /\{\{([\s\S]+?(\}?)+)\}\}/g,
    interpolate: /\{\{([\s\S]+?)\}\}/g,
    encode: /\{\{!([\s\S]+?)\}\}/g

  }

  let escapeHtml = function(html) {
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

    return html
      ? html.toString().replace(/[&<>"'`=\/]/g, (s) => entityMap[s] || s)
      : '';
  };

  let unescape = (html) => html
    .replace(/\\('|\\)/g, "$1")
    .replace(/[\r\t\n]/g, ' ');


  let startend = {
    split: { start: "';out+=(this.", end: ");out+='", startendcode: "';out+=escapeHtml(" }
  }

  self.compile = function(tmpl = ''){
    let cse = startend.split
    , needHtmlEncode
    , sid = 0
    , indv
    , str = tmpl;

    let preComp = str
      .replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, ' ')
      .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, '')
      .replace(/'|\\/g, "\\$&")
      .replace(tmplSettings.interpolate, (m, code) =>
        `${cse.start}${unescape(code)}${cse.end}`)
      .replace(tmplSettings.encode, (m, code) =>
        {
          needHtmlEncode = true;

          return `${cse.startendcode}${unescape(code)}${cse.end}`
        });

    str = (`let out = '${preComp}';return out;`);

    str.replace(/\n/g, "\\n")
      .replace(/\t/g, '\\t')
      .replace(/\r/g, "\\r")
      .replace(/(\s|;|\}|^|\{)out\+='';/g, '$1')
      .replace(/\+''/g, "");

    if(needHtmlEncode) {
      str = `let escapeHtml=${escapeHtml};${str}`;
    }

    try {
      console.log('str', str)
      return new Function('test', str);
    } catch (e) {
      console.log(e)
      console.log("Could not create a template function: " + str)
    }

  }


}