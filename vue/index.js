class Vue {
  constructor(options) {
    this.data = options.data;
    this.methods = options.methods;
    this.mounted = options.mounted;
    this.el = options.el;

    this.init();
  }

  init() {
    // 代理 data
    Object.keys(this.data).forEach(key => {
      this.proxy(key);
    });
    // 监听 data
    observe(this.data, this);
    const compile = new Compile(this.el, this);
    // 生命周期其实就是在完成一些操作后调用的函数,
    // 所以有些属性或者实例在一些 hook 里其实还没有初始化，
    // 也就拿不到相应的值
    this.callHook('mounted');
  }

  proxy(key) {
    Object.defineProperty(this, key, {
      enumerable: false,
      configurable: true,
      get: function() {
        return this.data[key]
      },
      set: function(newVal) {
        this.data[key] = newVal;
      }
    });
  }

  callHook(lifecycle) {
    this[lifecycle]();
  }
}
