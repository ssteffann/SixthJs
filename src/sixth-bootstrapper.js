const CTRL_ATTR = 'data-controller';

class Bootstrapper {
  constructor() {
    this.ctrlMap = new Map();
    this.ctrlElemMap = new Map();

    this.registerCtrlElements();
  }

  registerCtrlElements(doc) {
    let ctrl = (doc||document).querySelectorAll(`[${CTRL_ATTR}]`);

    utils.forEachNode(ctrl, (elem) => {
      let name = elem.getAttribute(CTRL_ATTR);

      if (!name) {
        return;
      }

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

    if (!ctrl || !ctrlEelem) {
      return;
    }

    elements = utils.getdomElemens(ctrlEelem);

    if (!elem) {
      ctrl.clear();
      ctrl.bindModel();
    }

    ctrl.bindElements(elements);

    console.log('Binded ctrl:', ctrl)
  }

  clearElements() {
    this.ctrlElemMap.clear();
  }
}