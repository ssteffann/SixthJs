let http = function(options, useCache) {
  let cache = new Map();

  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest()
      , { method, url, params, headers} = options;

    if (useCache && cache.has(url)) {
      return resolve(cache.get(url));
    }

    request.open(method, url);

    request.onload = function() {
      if (this.status >= 200&&this.status < 300) {
        if (useCache) {
          cache.set(url, request.response);
        }

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

    if (headers&&typeof headers === 'object') {
      Object.keys(headers)
        .forEach((key) => request.setRequestHeader(key, headers[key]));
    }

    if (params&&typeof headers === 'object') {
      params = Object.keys(params)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');
    }

    request.send(params);
  });
};
