import languageMap from '../config/languages';
import dialogComponent from './languageSettingDialog';
import Cropper from './cropper';
import imageTranslateDialog from './imageTranslateDialog';
export default {
  components: {
    'set-lang-dialog': dialogComponent,
    'image-translate-dialog': imageTranslateDialog
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
      fromLang: 'Automatic',
      toCode: 'en',
      toLang: '英文',
      result: '',
      imgSrc: chrome.extension.getURL('icon128.png')
    }
  },
  mounted() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request) {
        switch (request.action) {
          case 'translate':
            this.result = request.result;
            break;
          case 'getSrcLang':
            this.fromCode = request.result.toLowerCase();
            this.fromLang = this.langs[this.fromCode];
            break;
          case 'captureScreen':
            {
              let image = new Image();
              image.onload = () => {
                let canvas = document.createElement('canvas');
                canvas.width = request.rect.w;
                canvas.height = request.rect.h;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(image, request.rect.x, request.rect.y, request.rect.w, request.rect.h, 0, 0, canvas.width, canvas.height);
                this.imgSrc = canvas.toDataURL();
                this.$nextTick(() => {
                  let cropper = Cropper.getInstace();
                  cropper.hide();
                  this.showImgTxDialog = true;
                  canvas = null;
                });
              };
              image.src = request.result;
            }
          default:
            break;
        }
      }
    });
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
    },
    showCropper() {
      let cropper = Cropper.getInstace();
      cropper.show();
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
    selectedText(val) {
      if (val) {
        this.result = `原文：${val}`;
        chrome.runtime.sendMessage({
          action: 'getSrcLang',
          text: val
        });
      }
    }
  },
  render() {
    return <div class="content" vOn:mousedown_stop={this.noop}>
      <div class="titlebar">
        <img src={chrome.extension.getURL('icon128.png')} class="logo" />
        <h3>划词翻译</h3>
      </div>
      <div class="toolbar">
        <div class="btn-group">
          <button class="btn" vOn:click={() => this.openSelectLanguageDialog('from')}>{this.fromLang}</button>
          <img src={chrome.extension.getURL('arrow.png')}/>
          <button class="btn" vOn:click={() => this.openSelectLanguageDialog('to')}>{this.toLang}</button>
        </div>
        <button class="btn" vOn:click={ this.sendTranslateRequest }>翻译</button>
        <button class="btn" style="margin-left: 10px;" vOn:click={ this.showCropper } >截图翻译</button>
      </div>
      <div class="translate-result">
        {this.result}
      </div>
      <set-lang-dialog show={this.showDialog} {...{on:{'update:show':(val) => this.showDialog = val}}} vModel={this.defaultCode}></set-lang-dialog>
      <image-translate-dialog show={this.showImgTxDialog} {...{on:{'update:show':(val) => this.showImgTxDialog = val}}} imgSrc={this.imgSrc}></image-translate-dialog>
    </div>
  }
}