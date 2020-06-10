import languageMap from '../config/languages';
import dialogComponent from './languageSettingDialog';
export default {
  components: {
    'set-lang-dialog': dialogComponent
  },
  props: {
    selectedText: {
      type: String,
      default: ''
    },
    result: {
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
      direction: 'from',
      fromCode: 'auto',
      fromLang: 'Automatic',
      toCode: 'en',
      toLang: '英文',
    }
  },
  methods: {
    noop() {
      console.log('stop click event');
    },
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
      chrome.runtime.sendMessage({
        action: 'translate',
        text: this.selectedText,
        from: this.fromCode,
        to: this.toCode
      });
    }
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
   
  },
  render() {
    return <div class="content" vOn:mousedown_stop={this.noop}>
      <div class="titlebar">
        <img src={chrome.extension.getURL('icon128.png')} style="height:20px;width:20px;" />
        <h3 style="margin: 0px 10px;">划词翻译</h3>
      </div>
      <div class="toolbar">
        <div style="display: flex;">
          <button class="btn" vOn:click={() => this.openSelectLanguageDialog('from')}>{this.fromLang}</button>
          <span style="font-size:20px;display:block;margin:0px 10px;">&#8407;</span>
          <button class="btn" vOn:click={() => this.openSelectLanguageDialog('to')}>{this.toLang}</button>
        </div>
        <button class="btn" style="margin-left: 10px;" vOn:click={ this.sendTranslateRequest }>翻译</button>
      </div>
      <div class="translate-result">
        {this.result}
      </div>
      <set-lang-dialog show={this.showDialog} {...{on:{'update:show':(val) => this.showDialog = val}}} vModel={this.defaultCode}></set-lang-dialog>
    </div>
  }
}