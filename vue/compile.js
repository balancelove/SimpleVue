const nodeType = {
  isElement(node) {
    return node.nodeType === 1;
  },
  isText(node) {
    return node.nodeType === 3;
  },
};


const updater = {
  text(node, val) {
    node.textContent = val;
  },
  // 还有 model 啥的，但实际都差不多
};

class Compile {
  constructor(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
  }

  init() {
    if(this.el) {
      this.fragment = this.nodeToFragment(this.el);
      this.compileElement(this.fragment);
      this.el.appendChild(this.fragment);
    }
  }

  nodeToFragment(el) {
    const fragment = document.createDocumentFragment();
    let child = el.firstChild;

    // 将原生节点转移到 fragment
    while(child) {
      fragment.appendChild(child);
      child = el.firstChild;
    }
    return fragment;
  }

  compileElement(el) {
    const childNodes = el.childNodes;
    
    [].slice.call(childNodes).forEach((node) => {
      const reg = /\{\{(.*)\}\}/;
      const text = node.textContent;

      // 根据不同的 node 类型，进行编译，分别编译指令以及文本节点
      if(nodeType.isElement(node)) {
        this.compileEl(node);
      } else if(nodeType.isText(node) && reg.test(text)) {
        this.compileText(node, reg.exec(text)[1]);
      }

      // 递归的对元素节点进行深层编译
      if(node.childNodes && node.childNodes.length) {
        this.compileElement(node);
      }
    });
  }

  compileText(node, exp) {
    const value = this.vm[exp.trim()];
    updater.text(node, value);
    new Watcher(this.vm, exp, val => {
      updater.text(node, val);
    });
  }

  compileEl(node) {
    const attrs = node.attributes;
    Object.values(attrs).forEach(attr => {
      var name = attr.name;
      if(name.indexOf('v-') >= 0) {
        const exp = attr.value;
        // 只做事件绑定
        const eventDir = name.substring(2);
        if(eventDir.indexOf('on') >= 0) {
          this.compileEvent(node, eventDir, exp);
        }
      }
    });
  }

  compileEvent(node, dir, exp) {
    const eventType = dir.split(':')[1];
    const cb = this.vm.methods[exp];

    if(eventType && cb) {
      node.addEventListener(eventType, cb.bind(this.vm));
    }
  }
}
