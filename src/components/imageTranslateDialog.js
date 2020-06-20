import Cropper from './cropper';
export default {
  props: {
    // imgSrc: {
    //   type: String,
    //   require: true
    // },
    show: {
      type: Boolean,
      default: false
    },
    // recognizeText: {
    //   type: String,
    //   default: ''
    // },
    showCropper: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imgSrc: chrome.extension.getURL('icon128.png'),
      result: '',
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
    recognize() {
      chrome.runtime.sendMessage({
        action: 'recognize',
        screenshot: this.imgSrc
      });
    },
    translate() {

    },
    showCropper() {
      
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
            <button title="识别" vOn:click={this.recognize}>
              <img src={chrome.extension.getURL('arrow.png')}/>
            </button>
            <div class="item result">
              <textarea value={this.recognizeText}>
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