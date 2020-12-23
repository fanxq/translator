export default {
  data() {
    return {
      msg: '',
      isShowMsg: false,
    }
  },
  methods: {
    showMsg(msg, delay=1500) {
      if (this.isShowMsg) {
        this.isShowMsg = false;
        this.$nextTick(() => {
          this.isShowMsg = true;
          this.msg = msg;
          setTimeout(() => {
            this.isShowMsg = false;
          }, delay);
        });
        return;
      }
      this.isShowMsg = true;
      this.msg = msg;
      setTimeout(() => {
        this.isShowMsg = false;
      }, delay);
    },
  },
}