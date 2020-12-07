import MessageHub from '../../content_scripts/messageHub';
export default {
  data() {
    return {
      imgSrc: chrome.extension.getURL('images/icon128.png'),
      result: '',
      translateResult: '',
      recognizeText: '',
      translateBtnDisable: true
    }
  },
  watch: {
    recognizeText(val) {
      this.result = val;
    },
    translateResult(val) {
      this.result = val;
    },
    result(val) {
      if(val) {
        this.translateBtnDisable = false;
      } else {
        this.translateBtnDisable = true;
      }
    }
  },
  mounted() {
    MessageHub.getInstance().eventBus.$on('setScreenshot', (data) => {
      if (data) {
        this.imgSrc = data;
        this.showDialog();
      }
    });
  },
  methods: {
    showDialog() {
      this.$refs.dlg.showModal();
    },
    closeDialog() {
      this.$refs.dlg.close();
      this.resetData();
    },
    resetData() {
      this.recognizeText = '';
      this.translateResult = '';
      this.result = '';
      this.imgSrc = chrome.extension.getURL('images/icon128.png');
      this.translateBtnDisable = true;
    },
    close() {
      MessageHub.getInstance().setVisible(true);
      this.closeDialog();
    },
    recognize() {
      MessageHub.getInstance().send({
        action: 'recognize',
        screenshot: this.imgSrc
      }).then(response => {
        this.recognizeText = response;
      });
    },
    translate() {
      if (!this.result) {
        alert('请先识别图片!');
      }
      new Promise((resolve, reject) => {
        chrome.storage.local.get('translateTo', (result) => {
          resolve(result.translateTo || 'zh-cn');
        });
      }).then((translateTo) => {
        MessageHub.getInstance().send({
          action: 'translate',
          text: this.result,
          from: 'auto',
          to: translateTo
        }).then(result => {
          this.translateResult = result;
        });
      }).catch(err => {
        alert('请重试！');
      });
    },
  },
  render() {
    return (<dialog ref="dlg" 
      class="img-translate-dialog"
      on={{mousedown: (e)=>{ e.stopPropagation();}}}>
      <section class="dialog--content">
        <header>
          <span class="title">
            <img src={chrome.extension.getURL('images/icon128.png')} class="logo"/>
            <h3>截图翻译</h3>
          </span>
          <button class="btn-close" on={{click: this.close}} title="关闭">
            <img src={chrome.extension.getURL('images/close.png')}/>
          </button>
        </header>
        <section class="toolbar">
          <div class="section-settings">

          </div>
        </section>
        <section class="body">
          <div class="body-content">
            <div class="item">
              <img src={this.imgSrc}/>
            </div>
            <button on={{click: this.recognize}}>
              <img src={chrome.extension.getURL('images/arrow.png')}/>
              <span>识别</span>
            </button>
            <div class="item result">
              <textarea vModel={this.result}>
              </textarea>
              <span class="btn-group">
                <button class="btn" on={{click: this.translate}} disabled={this.translateBtnDisable}>翻译</button>
              </span>
            </div>
          </div>
        </section>
      </section>
    </dialog>)
  }
}