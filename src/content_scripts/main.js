import TranslationExtension from './extension.js';
let isInit = false;
document.addEventListener("DOMContentLoaded", () => {
  if (!isInit) {
    console.log('init extension');
    new TranslationExtension();
    isInit = true;
  }
});