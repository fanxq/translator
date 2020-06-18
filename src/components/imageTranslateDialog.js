export default {
  props: {
    imgSrc: {
      type: String,
      require: true
    },
    show: {
      type: Boolean,
      default: false
    },
    recognizeText: {
      type: String,
      default: ''
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
    },
    translate() {
      chrome.runtime.sendMessage({
        action: 'recognize',
        screenshot: this.imgSrc
      });
    }
  },
  render() {
    return (<dialog ref="dlg" style="width:800px; height:300px;">
        <header>
          <span class="titlebar">
            <img src={chrome.extension.getURL('icon128.png')} class="logo"/>
            <h3>截图翻译</h3>
          </span>
          <button class="btn-close" vOn:click={this.close} title="关闭">
            <img src={chrome.extension.getURL('close.png')}/>
          </button>
        </header>
        <section class="body">
          <div class="body-content">
            <div class="item">
              <img src={this.imgSrc}/>
            </div>
            <button title="翻译" vOn:click={this.translate}>
              <img src={chrome.extension.getURL('arrow.png')}/>
            </button>
            <div class="item result">
              {this.recognizeText}
            </div>
          </div>
        </section>
      </dialog>)
  }
}