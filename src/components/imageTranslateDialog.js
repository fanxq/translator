export default {
  props: {
    imgSrc: {
      type: String,
      require: true
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.showDialog();
      } else {
        this.closeDialog();
      }
    }
  },
  methods: {
    showDialog() {
      this.$refs.dlg.showModal();
    },
    closeDialog() {
      this.$refs.dlg.close();
    },
    close() {
      this.$emit('update:show', false);
    }
  },
  render() {
    return (<dialog ref="dlg">
        <header>
          <span class="titlebar">
            <img src={chrome.extension.getURL('icon128.png')} class="logo"/>
            <h3>截图翻译</h3>
          </span>
          <button class="btn-close" vOn:click={this.close} title="关闭">&#x2716;</button>
        </header>
        <section class="body">
          <img src={this.imgSrc}/>
        </section>
      </dialog>)
  }
}