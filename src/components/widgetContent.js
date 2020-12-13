import languageMap from '../assets/config/languages';
import dialogComponent from './languageSettingDialog';
import MessageHub from '../content_scripts/messageHub';

export default {
  components: {
    'set-lang-dialog': dialogComponent,
  },
  props: {
    selectedText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      langs: languageMap,
      defaultCode: 'en',
      disable: true,
      showDialog: false,
      showImgTxDialog: false,
      direction: 'from',
      fromCode: 'auto',
      fromLang: '自动匹配',
      toCode: 'en',
      toLang: '英文',
      result: '',
      enableScreenshot: false,
      isTranslated: false,
    }
  },
  computed: {
    linkToResultDetail() {
      return `https://translate.google.cn/?sl=auto&tl=${this.toCode}&text=${encodeURIComponent(this.selectedText)}&op=translate`;
    }
  },
  methods: {
    openSelectLanguageDialog(direction) {
      this.showDialog = true;
      this.direction = direction;
      if (direction === 'to') {
        this.defaultCode = this.toCode;
      } else {
        this.defaultCode = this.fromCode;
      }
    },
    sendTranslateRequest() {
      if (this.fromCode === this.toCode) {
        alert('源语言与目标语言相同，请更换目标语言！');
        return;
      }
      MessageHub.getInstance().send({
        action: 'translate',
        text: this.selectedText,
        from: this.fromCode,
        to: this.toCode
      }).then(result => {
        this.isTranslated = true;
        this.result = result;
      }).catch(err => {
        alert(`获取翻译失败：${err}`);
      });
    },
    showCropper() {
      this.$showCropper();
    },
    resetScreenshotBtn() {
      chrome.storage.local.get('enableScreenshot', (reslut) => {
        console.log('是否启用截图翻译：', reslut.enableScreenshot);
        this.enableScreenshot = reslut.enableScreenshot || false;
      });
    },
    setContentInvisible() {
      MessageHub.getInstance().setVisible(false);
    },
  },
  watch: {
    defaultCode(val) {
      console.log(val);
      if (this.direction === 'to') {
        this.toLang = this.langs[val];
        this.toCode = val;
      } else {
        this.fromCode = val;
        this.fromLang = this.langs[val];
      }
    },
    selectedText(val) {
      if (val) {
        this.isTranslated = false;
        this.result = `${val}`;
        MessageHub.getInstance().send({
          action: 'getSrcLang',
          text: val
        }).then(result => {
          this.fromCode = (result && result.toLowerCase()) || 'auto';
          this.fromLang = this.langs[this.fromCode];
        }).catch(err => {
          alert(`识别源语言失败：${err}`);
        });
      }
    },
  },
  mounted() {
    this.resetScreenshotBtn();
    MessageHub.getInstance().eventBus.$on('refresh-widget-content', () => {
      this.resetScreenshotBtn();
    });
    MessageHub.getInstance().eventBus.$on('show-cropper', () => {
      this.showCropper();
      this.setContentInvisible();
    });
  },
  render() {
    return <div class="content" on={{mousedown: (e)=>{ e.stopPropagation();}}}>
      <div class="titlebar">
        <img src={chrome.extension.getURL('images/icon128.png')} class="logo" />
        <h3>划词翻译</h3>
      </div>
      <div class="toolbar">
        <div class="btn-group">
          <button class="btn tooltips" tips="源语言" on={{click: () => this.openSelectLanguageDialog('from')}}>{this.fromLang}</button>
          <span>&#10140;</span>
          <button class="btn tooltips" tips="目标语言" on={{click: () => this.openSelectLanguageDialog('to')}}>{this.toLang}</button>
        </div>
        <div class="btn-group">
          <button class="btn" on={{click: this.sendTranslateRequest}}>翻译</button>
          <button class="btn" 
            style={{marginLeft: '10px', display: this.enableScreenshot ? 'inline-block' : 'none'}}
            on={{click: this.showCropper}} >
              截图翻译
          </button>
        </div>
      </div>
      <div class="translate-result">
        <div class="inner-toolbar">
          <span class="tag">{this.isTranslated ? '译文' : '原文'}</span>
          <a href={this.linkToResultDetail} style={{display: this.isTranslated ? 'inline' : 'none'}} target="_blank" rel="noopener nofollow">查看更多释义&#187;</a>
        </div>
        {this.result}
      </div>
      <set-lang-dialog show={this.showDialog} {...{on:{'update:show':(val) => this.showDialog = val}}} vModel={this.defaultCode}></set-lang-dialog>
    </div>
  }
}