import Vue from 'vue';
import imageTranslateDialog from './imageTranslateDialog';

const ImgTxDlgConstructor = Vue.extend(imageTranslateDialog);
let imgTxDlgInstance = null;

export default {
  install(vue) {
    vue.prototype.$imgTranslateDialog = function() {
      if (imgTxDlgInstance) {
        imgTxDlgInstance.showCropper();
        return;
      }
      imgTxDlgInstance = new ImgTxDlgConstructor();
      imgTxDlgInstance.$mount();
      let parentNode = document.querySelector('#TX_SH_0001').shadowRoot;
      parentNode.appendChild(imgTxDlgInstance.$el);
      imgTxDlgInstance.showCropper();
    }
  }
}