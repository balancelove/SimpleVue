class Observer {
  constructor(data) {
    this.data = data;
    this.init();
  }

  init() {
    this.walk();
  }

  walk() {
    Object.keys(this.data).forEach(key => {
      this.defineReactive(key, this.data[key]);
    });
  }

  defineReactive(key, val) {
    const dep = new Dep();
    const observeChild = observe(val);
    Object.defineProperty(this.data, key, {
      enumerable: true,
      configurable: true,
      get() {
        if(Dep.target) {
          dep.addSub(Dep.target);
        }
        return val;
      },
      set(newVal) {
        if(newVal === val) {
          return;
        }
        val = newVal;
        dep.notify();
        observe(newVal);
      }
    });
  }
}

function observe(value, vm) {
  if(!value || typeof value !== 'object') {
    return;
  }
  return new Observer(value);
}
