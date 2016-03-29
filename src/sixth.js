(function() {
  const ctrlAttr = 'data-controller';
  const modelAttr = 'data-model';


  class Scope {
    constructor(){
      this.init = '';
    }
  };

  class Controller {
    constructor(name, callback) {
      this.ctrlName = name;
      this.callback = callback;
      this.ctrlElement = document.querySelector(`[${ctrlAttr}=${name}]`);
      this.modelElements = this.ctrlElement.querySelectorAll(`[${modelAttr}]`)
    }

    render (name, value) {
      for(let key in this.modelElements) {
        let element = this.modelElements[key];

        if(element.tagName
          && element.tagName !== 'INPUT'
          && element.getAttribute(modelAttr) === name)
        {
          console.log('render', value)
          element.innerHTML = value;
        }

      }
    }
  };

  let self = {}
  window.sixth = self;


  self.controller = function(name, callback) {
    let ctrl = new Controller(name, callback);

    let scope = new Proxy(new Scope(),{
      set: function(model, property, value) {
        let oldValue = model[property];

        if(oldValue === value) return;

        model[property] = value;
        ctrl.render(property, value)

      }
    });

    callback.call(scope)


    for(let key in ctrl.modelElements) {
      let element = ctrl.modelElements[key]

      if(element.tagName === 'INPUT'){
        element.addEventListener('keyup', function(){
          scope[element.getAttribute(modelAttr)] = this.value;
        })
      }
    }


    console.log('scope', scope)
    console.log('ctrl', ctrl)
  }


})();