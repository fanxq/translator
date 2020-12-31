import MessageHub from '../../content_scripts/messageHub';
import Select from './select';
import mixin from './mixin';
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
  mixins: [mixin],
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
      isTranslated: false,
    }
  },
  computed: {
    linkToResultDetail() {
      return `https://translate.google.cn/?sl=auto&tl=${this.translateTo}&text=${encodeURIComponent(this.recognizeResult)}&op=translate`
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
      }).catch(err => {
        let lang = this.recognizeLangs.find(x => x.code === code);
        this.showMsg(`Tesseract加载 ${lang && lang.name} 训练数据集失败！`)
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
      this.recognizeBtnDisable = false;
      this.isTranslated = false;
    },
    resetResult() {
      this.recognizeResult = '';
      this.translateResult = '';
      this.displayedResult = '';
    },
    close() {
      MessageHub.getInstance().store.showCropper = false;
      this.closeDialog();
    },
    recognize() {
      this.resetResult();
      this.tips = '识别中...';
      this.loading = true;
      this.recognizeBtnDisable = true;
      this.isTranslated = false;
      MessageHub.getInstance().send({
        action: 'recognize',
        screenshot: this.imgSrc
      }, 30).then(response => {
        this.recognizeResult = response;
        this.displayedResult = response;
        this.loading = false;
        this.recognizeBtnDisable = false;
      }).catch(err => {
        this.showMsg('图片识别出错！');
        this.loading = false;
        this.recognizeBtnDisable = false;
      });
    },
    translate() {
      if (this.recognizeResult !== this.displayedResult && !this.isTranslated) {
        this.showMsg('识别文本已被修改，将使用修改后的文本进行翻译！', 2500);
        this.recognizeResult = this.displayedResult;
      }
      this.tips = '翻译中...';
      this.loading = true;
      this.translateBtnDisable = true;
      MessageHub.getInstance().send({
        action: 'translate',
        text: this.recognizeResult,
        from: 'auto',
        to: this.translateTo
      }).then(result => {
        this.translateResult = result;
        this.displayedResult = result;
        this.loading = false;
        this.isTranslated = true;
        this.translateBtnDisable = false;
      }).catch(err => {
        this.showMsg('翻译出错了，请稍后再试！', 2000);
        this.loading = false;
        this.isTranslated = true;
        this.translateBtnDisable = false;
      });
    },
  },
  render() {
    return (
      <dialog 
        ref="dlg" 
        class={['img-translate-dialog', this.isShowMsg && 'show-msg']}
        onMousedown={(e)=>{ e.stopPropagation();}}
        msg={this.msg}
      >
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
          <div class="btn-group">
            <button class="btn" onClick={this.translate} disabled={this.translateBtnDisable}>翻译</button>
            <button class="btn tooltips" style={{display: this.recognizeResult ? 'inline' : 'none'}} tips="使用识别文本查看更多释义">
              <a href={this.linkToResultDetail}  target="_blank" rel="noopener nofollow">更多释义&#187;</a>
            </button>
          </div>
        </section>
        <section class="body">
          <div class="body-content">
            <div class="item">
              <img src={this.imgSrc}/>
            </div>
            <button on={{click: this.recognize}} disabled={this.recognizeBtnDisable}>
              <span>&#10140;</span>
              <span>识别</span>
            </button>
            <div class={['item', 'result',this.loading ? 'loading' : '']} tips={this.tips}>
              <textarea vModel={this.displayedResult} readonly={this.isTranslated}>
              </textarea>
            </div>
          </div>
        </section>
      </section>
    </dialog>)
  }
}