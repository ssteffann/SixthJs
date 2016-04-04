(function() {
  const CTRL_ATTR = 'data-controller';
  const MODEL_ATTR = 'data-model';

  let self = {}

  window.sixth = self;
  
  let utils = {
    isUndefined: (value) => typeof value === 'undefined',
    isDefined: (value) => typeof value !== 'undefined'
  }
  /**
   * Work in progress
   */
  class Scope {
    constructor(){}

    getModel() {
      return Object.keys(this)
        .reduce((mappedData, key) => {
          mappedData[key] = [];

          return mappedData
        }, {});
    }
  };

  /**
   * Controller class that bind model and view
   */
  class Controller {
    constructor(name, callback) {
      this.ctrlName = name;
      this.isBinded = false;

      this.scope = new Proxy(new Scope(),{
        set: (model, property, value) => {
          let oldValue = model[property];

          if(oldValue === value) return true;

          model[property] = value;

          this.isBinded && this.render(property, value)

          return true;
        }
      });

      this.callback = callback;
      this.ctrlElement = document.querySelector(`[${CTRL_ATTR}=${name}]`);
      this.bindModel();
    }

    /**
     * Sort each element with data-model attribut to it model in scope
     * @returns {*}
     */
    bindModel(){
      let domElements = this.ctrlElement.querySelectorAll(`[${MODEL_ATTR}]`);

      this.callback.call(this.scope);
      this.modelView = this.scope.getModel();

      for(let key in domElements) {
        let element = domElements[key];

        if(!element.tagName) return;

        let name = element.getAttribute(MODEL_ATTR);

        if(!this.modelView.hasOwnProperty(name)) return;

        this.modelView[name].push(element);

        if (utils.isDefined(element.value)) {
          let event = this.getEvent(this.scope, element.type, name);

          element.addEventListener(event.name, event.fn, false);
        }

        this.isBinded = true;
        this.render(name, this.scope[name]);
      }
    };

    getEvent(scope, type, name) {
      let setValue = function(event) {
        this.isTouched = true;
        scope[name] = event.target.value;
      }

      let eventsTypes = {
        'default': () => ({
          name: 'keyup',
          fn: setValue
        }),
        'checkbox': () => ({
          name: 'change',
          fn: function(event) {
            this.isTouched = true;
            scope[name] = event.target.checked;
          }
        }),
        'radio': () => ({
          name: 'change',
          fn: setValue
        }),
        'select-one': () => ({
          name: 'change',
          fn: setValue
        })
      }

      return eventsTypes.hasOwnProperty(type)
        ? eventsTypes[type]()
        : eventsTypes.default();

    };

    //TODO: Need to add support for change and click, and also for select tag,
    // and check the checkbox, it doesn't work properly

    render(name, value) {
      let elementsType = {
        checkbox: (element, value) => {
          element.setAttribute('checked', !!value);
        },
        radio: (element, value) => {
          if (element.value === value && !element.checked) {
            element.setAttribute('checked', true);
          }
        },
        default: (element, value) => {
          element.value = value;
        }
      };

      this.modelView[name].forEach((element) => {

        try {
          if (utils.isDefined(element.value)) {

            if(element.isTouched) return element.isTouched = false;

            elementsType[element.type]
              ? elementsType[element.type](element, value)
              : elementsType.default(element, value);

          } else {
            element.innerHTML = value;
          }

        } catch (error) {
          console.log(error)
        }

      });
    }
  };


  self.controller = function(name, callback) {
    let ctrl = new Controller(name, callback);

    console.log('ctrl', ctrl)
  }


})();