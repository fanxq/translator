import Vue from 'vue';
import cropper from './cropper';
import imageTranslateDialog from './imageTranslateDialog';

const CropperCtor = Vue.extend(cropper);
const ImageTranslateDialogCtor = Vue.extend(imageTranslateDialog);
let imgTxDlgInstance = null;
let cropperInstance = null;
let isInit = false;

export default {
  install(vue) {
    vue.prototype.$showCropper = function() {
      if (isInit) {
        cropperInstance.show();
        return;
      }
      imgTxDlgInstance = new ImageTranslateDialogCtor();
      imgTxDlgInstance.$mount();
      let parentNode = document.querySelector('#TX_SH_0001').shadowRoot;
      parentNode.appendChild(imgTxDlgInstance.$el);
      cropperInstance = new CropperCtor();
      cropperInstance.$mount();
      parentNode.appendChild(cropperInstance.$el);
      cropperInstance.show();
      isInit = true;
    }
  }
}