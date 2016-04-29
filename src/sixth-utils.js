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
      let json = attrValue.replace(/[.\w\d\/-]+/g, '"$&"');

      return JSON.parse(json);
    } catch (err) {
      new logError('Invalid syntax in binding: ' + attrValue)
    }
  }
};
