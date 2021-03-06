import { DEFAULT_TPL } from '../utils';

console.warn('组件所依赖的 rax-countdown 版本较旧，请尽快重新构建发布该组件');
Component({
  data: {
    count: 0
  },
  props: {
    timeRemaining: 0,
    interval: 1000,
    timeWrapStyle: '',
    textStyle: '',
    timeStyle: '',
    secondStyle: '',
    tpl: '{d}天{h}时{m}分{s}秒',
    onFormatFunc: null,
    onTick: null,
    onComplete: null
  },
  didMount: function didMount() {
    const funcToExecute = this.props.onFormatFunc && typeof this.props.onFormatFunc === 'function'
      ? this.props.onFormatFunc : this.msToTime;
    this.funcToExecute = funcToExecute.bind(this);

    this.counter = setInterval(() => {
      this.funcToExecute();
    }, this.props.interval);
  },
  didUnmount: function didUnmount() {
    if (this.counter) clearInterval(this.counter);
  },
  methods: {
    msToTime() {
      const { count } = this.data;
      const timeDuration = this.props.timeRemaining - count * this.props.interval;
      this.setData({
        count: count + 1
      });

      if (!timeDuration || timeDuration <= 0) {
        if (this.counter) clearInterval(this.counter);
      }

      // parameter type of `parseInt` is 'string', so need to convert time to string first.
      var seconds = parseInt((timeDuration / 1000 % 60).toString()),
        minutes = parseInt((timeDuration / (1000 * 60) % 60).toString()),
        hours = parseInt((timeDuration / (1000 * 60 * 60) % 24).toString()),
        days = parseInt((timeDuration / (1000 * 60 * 60 * 24)).toString());

      const timeType = {
        'd': days < 10 ? '0' + days : days + '',
        'h': hours < 10 ? '0' + hours : hours + '',
        'm': minutes < 10 ? '0' + minutes : minutes + '',
        's': seconds < 10 ? '0' + seconds : seconds + ''
      };

      // format time
      const tpl = this.props.tpl || DEFAULT_TPL;
      const rule = new RegExp('\{[d,h,m,s]\}', 'g'); // used to matched all template item, which includes 'd', 'h', 'm' and 's'.
      let matchlist = [];
      let tmp = null;
      let { textStyle, timeWrapStyle } = this.props;

      while ((tmp = rule.exec(tpl)) !== null) {
        matchlist.push(tmp.index, tmp.index);
      }

      if (matchlist.length !== 0) {
        // used to detect the last element
        matchlist.push(-1);
      }

      let lastPlaintextIndex = 0;
      let parsedTime = matchlist.map((val, index) => {
        if (val === -1) {
          // don't forget the potential plain text after last matched item
          let lastPlaintext = tpl.slice(lastPlaintextIndex);
          return {
            value: lastPlaintext,
            style: textStyle
          };
        }

        let matchedCharacter = tpl[val + 1];

        switch (matchedCharacter) {
          case 'd':
          case 'h':
          case 'm':
          case 's':
            if (index % 2 === 0) {
              // insert plain text before current matched item
              return {
                value: tpl.slice(lastPlaintextIndex, val),
                style: textStyle
              };
            } else {
              // replace current matched item to realtime string
              lastPlaintextIndex = val + 3;
              return {
                value: this.splitTime(timeType[matchedCharacter]),
                style: timeWrapStyle,
                isTime: true
              };
            }
          default:
            return null;
        }
      });

      parsedTime = parsedTime.filter((item) => item);

      // check if the onTick function needs to be called
      const callOnTick = this.props.onTick && typeof this.props.onTick === 'function';

      this.setData({
        parsedTime
      }, callOnTick ? this.props.onTick : null);

      // check if onComplete function needs to be called
      if (timeDuration <= 0 &&
        this.props.onComplete && typeof this.props.onComplete === 'function') {
        this.props.onComplete();
      }
    },
    splitTime(time = '00') {
      return time.split('');
    }
  }
});
