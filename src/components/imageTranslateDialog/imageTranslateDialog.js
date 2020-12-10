import MessageHub from '../../content_scripts/messageHub';
import Select from './select';
import languageMap from '../../assets/config/languages';
let langList = Object.keys(languageMap).map(x => {
  return {
    code: x,
    name: languageMap[x]
  }
});

export default {
  components: {
    'lang-select': Select
  },
  data() {
    return {
      imgSrc: chrome.extension.getURL('images/icon128.png'),
      displayedResult: '', // 显示结果
      translateResult: '', // 翻译结果
      recognizeResult: '', // 识别结果
      translateBtnDisable: true,
      recognizeBtnDisable: false,
      recognizeTo: 'eng',
      translateTo: 'zh-cn',
      recognizeLangs: [
        {name: '中文(简体)', code: 'chi_sim'},
        {name: '英文', code: 'eng'},
        {name: '日文', code: 'jpn'}
      ],
      tips: '翻译中...',
      loading: false,
      translateLangs: JSON.parse(JSON.stringify(langList)),
    }
  },
  watch: {
    displayedResult(val) {
      if(val) {
        this.translateBtnDisable = false;
      } else {
        this.translateBtnDisable = true;
      }
    },
    recognizeTo(code) {
      chrome.storage.local.set({'recognizeTo': code});
      MessageHub.getInstance().send({
        action: 'reloadTesseract',
        lang: code
      }).then(result => {
        if (result !== 'ok') {
          let lang = this.recognizeLangs.find(x => x.code === code);
          alert(`Tesseract加载 ${lang && lang.name} 训练集失败！原因：${result}`);
        }
      });
    },
  },
  mounted() {
    chrome.storage.local.get('recognizeTo', (result) => {
      this.recognizeTo = result.recognizeTo || 'eng';
    });
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
      this.resetResult();
      this.imgSrc = chrome.extension.getURL('images/icon128.png');
      this.translateBtnDisable = true;
    },
    resetResult() {
      this.recognizeResult = '';
      this.translateResult = '';
      this.displayedResult = '';
    },
    close() {
      MessageHub.getInstance().setVisible(true);
      this.closeDialog();
    },
    recognize() {
      this.resetResult();
      this.tips = '识别中...';
      this.loading = true;
      this.recognizeBtnDisable = true;
      MessageHub.getInstance().send({
        action: 'recognize',
        screenshot: this.imgSrc
      }, 30).then(response => {
        this.recognizeResult = response;
        this.displayedResult = response;
        this.loading = false;
        this.recognizeBtnDisable = false;
      }).catch(err => {
        alert(`图片识别出错，原因：${err}`);
        this.loading = false;
        this.recognizeBtnDisable = false;
      });
    },
    translate() {
      if (!this.recognizeResult) {
        alert('请先识别图片!');
        return;
      }
      this.tips = '翻译中...';
      this.loading = true;
      MessageHub.getInstance().send({
        action: 'translate',
        text: this.recognizeResult,
        from: 'auto',
        to: this.translateTo
      }).then(result => {
        this.translateResult = result;
        this.displayedResult = result;
        this.loading = false;
      }).catch(err => {
        alert(`翻译出错了，原因：${err}`);
        this.loading = false;
      });
    },
  },
  render() {
    return (<dialog ref="dlg" 
      class="img-translate-dialog"
      onMousedown={(e)=>{ e.stopPropagation();}}>
      <section class="dialog--content">
        <header>
          <span class="title">
            <img src={chrome.extension.getURL('images/icon128.png')} class="logo"/>
            <h3>截图翻译</h3>
          </span>
          <button class="icon-btn" on={{click: this.close}} data-title="关闭">
            <img src={chrome.extension.getURL('images/close.png')}/>
          </button>
        </header>
        <section class="toolbar">
          <div class="section-settings">
            <button class="icon-btn" data-title="设置">
              <img src={chrome.extension.getURL('images/cog.png')}/>
            </button>
            <span class="settings-item">
              识别为<lang-select vModel={this.recognizeTo} options={this.recognizeLangs}></lang-select>
            </span>
            <span  class="settings-item">
              翻译为<lang-select vModel={this.translateTo} options={this.translateLangs}></lang-select>
            </span>
          </div>
          <div>
            <button class="btn" onClick={this.translate} disabled={this.translateBtnDisable}>翻译</button>
          </div>
        </section>
        <section class="body">
          <div class="body-content">
            <div class="item">
              <img src={this.imgSrc}/>
            </div>
            <button on={{click: this.recognize}} disabled={this.recognizeBtnDisable}>
              <img src={chrome.extension.getURL('images/arrow.png')}/>
              <span>识别</span>
            </button>
            <div class={['item', 'result',this.loading ? 'loading' : '']} tips={this.tips}>
              <textarea vModel={this.displayedResult}>
              </textarea>
            </div>
          </div>
        </section>
      </section>
    </dialog>)
  }
}