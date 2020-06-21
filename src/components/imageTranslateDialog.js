import Cropper from './cropper';
import MessageHub from '../messageHub';
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    isCropperVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imgSrc: chrome.extension.getURL('icon128.png'),
      result: '',
      translateResult: '',
      recognizeText: ''
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.showDialog();
      } else {
        this.closeDialog();
      }
    },
    isCropperVisible(val) {
      if (val) {
        Cropper.getInstace().show();
      } else {
        Cropper.getInstace().hide();
      }
    },
    recognizeText(val) {
      this.result = val;
    },
    translateResult(val) {
      this.result = val;
    }
  },
  mounted() {
    MessageHub.getInstance().eventBus.$on('setScreenshot', (data) => {
      if (data) {
        this.imgSrc = data;
        this.$emit('update:show', true);
        this.$emit('update:isCropperVisible', false);
      }
    });
  },
  methods: {
    showDialog() {
      this.$refs.dlg.showModal();
    },
    closeDialog() {
      this.$refs.dlg.close();
    },
    close() {
      this.$emit('update:isCropperVisible', false);
      this.$emit('update:show', false);
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
      if (!this.recognizeText) {
        alert('请先识别图片!');
      }
      MessageHub.getInstance().send({
        action: 'translate',
        text: this.recognizeText,
        from: 'auto',
        to: 'en'
      }).then(result => {
        this.translateResult = result;
      });
    },
  },
  render() {
    return (<dialog ref="dlg" style="width:800px; height:350px; padding-bottom: 40px;">
        <header>
          <span class="title">
            <img src={chrome.extension.getURL('icon128.png')} class="logo"/>
            <h3>截图翻译</h3>
          </span>
          <button class="btn-close" vOn:click={this.close} title="关闭">
            <img src={chrome.extension.getURL('close.png')}/>
          </button>
        </header>
        <section class="body" style="overflow: initial;">
          <div class="body-content">
            <div class="item">
              <img src={this.imgSrc}/>
            </div>
            <button title="识别" vOn:click={this.recognize}>
              <img src={chrome.extension.getURL('arrow.png')}/>
            </button>
            <div class="item result">
              <textarea value={this.result}>
              </textarea>
              <span class="btn-group">
                  <button class="btn" vOn:click={this.translate}>翻译</button>
                  <button class="btn">纠错</button>
                </span>
            </div>
          </div>
        </section>
      </dialog>)
  }
}