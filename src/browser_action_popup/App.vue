<template>
  <div>
    <div class="option-item">
      <span>启用翻译</span>
      <switch-button v-model="enable"/>
    </div>
    <div class="option-item">
      <span>启用截图翻译<span class="tag">Ctrl+Shift+X</span></span>
      <switch-button v-model="enableScreenshot" :disabled="!enable"/>
    </div>
    <div class="option-item" style="margin-top: 10px;" v-show="enableScreenshot">
      <button class="btn center" @click="showImageTranslateDialog">开始截图翻译</button>
    </div>
  </div>
</template>

<script>
import switchButton from './components/SwitchButton.vue';
export default {
  components: {
    'switch-button': switchButton
  },
  data() {
    return {
      enable: false,
      enableScreenshot: false,
    }
  },
  watch: {
    enable(val) {
      chrome.storage.local.set({'enable': val});
      if (!val) {
        this.enableScreenshot = false;
      }
    },
    enableScreenshot(val) {
      chrome.storage.local.set({'enableScreenshot': val});
      if (!val) {
        this.$nextTick(()=>{
         window.location.reload();
        });
      }
    }
  },
  mounted() {
    chrome.storage.local.get('enable', (result) => {
      this.enable = result.enable || false;
    });
    chrome.storage.local.get('enableScreenshot', (reslut) => {
      this.enableScreenshot = reslut.enableScreenshot || false;
    });
  },
  methods: {
    showImageTranslateDialog() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {from: 'popup', cmd: 'showCropper'});
      });
    }
  }
}
</script>

<style lang="scss" scoped>
  .option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 280px;
    font-size: 14px;
    font-family: sans-serif;
    padding: 8px;
    .tag {
      margin-left: 24px;
      color: #999;
    }
    &:first-child {
      border-bottom: 1px solid #ccc;
    }
    ul {
      list-style: none;
      padding: 0px;
      margin: 0px;
      li {
        display: inline-block;
        margin: 0px 5px;
        padding: 5px;
        border-radius: 2px;
        cursor: pointer;
        border: 1px solid #4b8bf4;
        &.active {
          background-color: #4b8bf4;
          color: #fff;
        }
      }
    }
    .btn {
      border: none;
      outline: none;
      appearance: none;
      background-color: #4b8bf4;
      color: #fff;
      padding: 8px 10px;
      border-radius: 2px;
      font-size: 14px;
      &:hover {
        background-color: #315a9c;
      }
    }
    .center {
      margin: 0 auto;
    }
  }
</style>