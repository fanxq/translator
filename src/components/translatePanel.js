import languageMap from '../assets/config/languages';
import dialogComponent from './languageSettingDialog';
import MessageHub from '../content_scripts/messageHub';

const TIPS = '翻译中...';
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
      toCode: 'en',
      result: '',
      enableScreenshot: false,
      isTranslated: false,
      isTranslating: false,
      tips: TIPS,
    }
  },
  computed: {
    fromLang() {
      return this.langs[this.fromCode];
    },
    toLang() {
      return this.langs[this.toCode];
    },
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
    toggleResult() {
      if (this.isTranslated) {
        this.isTranslated = false;
      } else {
        this.sendTranslateRequest();
      }
    },
    sendTranslateRequest() {
      this.isTranslating = true;
      this.tips = TIPS;
      MessageHub.getInstance().send({
        action: 'translate',
        text: this.selectedText,
        from: this.fromCode,
        to: this.toCode
      }).then(result => {
        this.isTranslated = true;
        this.isTranslating = false;
        this.result = result;
      }).catch(err => {
        this.isTranslated = false;
        this.isTranslating = true;
        this.tips = '出错了！请稍后再试！';
      });
      
    },
    showCropper() {
      chrome.storage.local.get({
        'enable': false,
        'enableScreenshot': false
      }, (result) => {
        if (result.enable && result.enableScreenshot) {
          this.$showCropper();
          this.hidePanel();
        }
      });
    },
    resetData() {
      this.isTranslated = false;
      this.isTranslating = false;
      this.tips = TIPS;
      chrome.storage.local.get('enableScreenshot', (reslut) => {
        console.log('是否启用截图翻译：', reslut.enableScreenshot);
        this.enableScreenshot = reslut.enableScreenshot || false;
      });
      if (this.$refs.resultPanel) {
        this.$refs.resultPanel.scrollTo({top: 0, behavior: 'smooth'});
      }
    },
    hidePanel() {
      MessageHub.getInstance().store.showCropper = true;
    },
  },
  watch: {
    defaultCode(val) {
      console.log(val);
      if (this.direction === 'to') {
        this.toCode = val;
      } else {
        this.fromCode = val;
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
        }).catch(err => {
          console.log(err);
        });
      }
    },
  },
  mounted() {
    this.resetData();
    MessageHub.getInstance().eventBus.$on('refresh-panel', () => {
      this.resetData();
    });
    MessageHub.getInstance().eventBus.$on('show-cropper', () => {
      this.showCropper();
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
          <button class="btn" onClick={this.toggleResult}>{this.isTranslated ? '返回原文' : '翻译'}</button>
          <button class="btn" 
            style={{marginLeft: '10px', display: this.enableScreenshot ? 'inline-block' : 'none'}}
            on={{click: this.showCropper}} >
              截图翻译
          </button>
        </div>
      </div>
      <div ref="resultPanel" 
        class={['translate-result', this.isTranslating ? 'translating' : '', this.tips !== TIPS ? 'error': '']} 
        tips={this.tips}
      >
        <div class="inner-toolbar">
          <span class="tag">{this.isTranslated ? '译文' : '原文'}</span>
          <a href={this.linkToResultDetail} style={{display: this.isTranslated ? 'inline' : 'none'}} target="_blank" rel="noopener nofollow">查看更多释义&#187;</a>
        </div>
        {this.isTranslated ? this.result : this.selectedText}
      </div>
      <set-lang-dialog show={this.showDialog} {...{on:{'update:show':(val) => this.showDialog = val}}} vModel={this.defaultCode}></set-lang-dialog>
    </div>
  }
}