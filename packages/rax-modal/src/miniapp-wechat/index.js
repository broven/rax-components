const UP_CASE_REG = /\B([A-Z])/g;

const triggleVisible = (instance, visible) => {
  instance.setData(
    {
      visibility: visible
    },
    () => {
      if (visible) {
        instance.triggerEvent('onShow');
        instance.triggerEvent('Show');
      } else {
        instance.triggerEvent('onHide');
        instance.triggerEvent('Hide');
      }
    }
  );
};

const loadStyle = (instance, maskStyle, contentStyle) => {
  const maskStyleState = computeStyle(maskStyle);
  const contentStyleState = computeStyle(contentStyle);
  instance.setData({
    maskStyleState: maskStyleState,
    contentStyleState: contentStyleState
  });
};

console.warn('组件所依赖的 rax-modal 版本较旧，请重新构建发布该组件');
Component({
  data: {
    visibility: false,
    maskStyleState: '',
    contentStyleState: ''
  },
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    maskStyle: {
      type: Object,
      value: {}
    },
    contentStyle: {
      type: Object,
      value: {}
    },
    maskCanBeClick: {
      type: Boolean,
      value: true
    },
    delay: {
      type: Number,
      value: 0
    },
    duration: {
      type: Number,
      value: 300
    }
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  attached() {
    const { delay, visible, maskStyle, contentStyle } = this.properties;
    if (visible) {
      if (delay) {
        setTimeout(() => {
          triggleVisible(this, visible, true);
        }, delay);
      } else {
        triggleVisible(this, visible, true);
      }
      loadStyle(this, maskStyle, contentStyle);
    }
  },
  observers: {
    visible(visible) {
      if (this.data.visibility !== visible) {
        if (this.properties.delay) {
          setTimeout(() => {
            triggleVisible(this, visible);
          }, this.properties.delay);
        } else {
          triggleVisible(this, visible);
        }
      }
    },
    'maskStyle, contentStyle': function(maskStyle, contentStyle) {
      loadStyle(this, maskStyle, contentStyle);
    }
  },
  methods: {
    onClick() {
      const { maskCanBeClick } = this.properties;
      if (maskCanBeClick) {
        this.triggerEvent('onHide');
        this.triggerEvent('Hide');
      }
      // In wechat miniprogram couldn't check function props wheather exist
      this.triggerEvent('onMaskClick');
      this.triggerEvent('MaskClick');
    }
  }
});

function computeStyle(style) {
  let handledStyle = '';
  Object.keys(style).forEach(key => {
    handledStyle =
      handledStyle +
      `${key.replace(UP_CASE_REG, '-$1').toLowerCase()}: ${style[key]};`;
  });
  return handledStyle;
}
