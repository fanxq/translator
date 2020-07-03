<template>
  <div>
    <div class="option-item">
      <span>启用翻译</span>
      <switch-button v-model="enable"/>
    </div>
    <div class="option-item">
      <span>启用截图翻译</span>
      <switch-button v-model="enableScreenshot" :disabled="!enable"/>
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
    },
    enableScreenshot(val) {
      chrome.storage.local.set({'enableScreenshot': val});
    }
  },
  mounted() {
    chrome.storage.local.get('enable', (result) => {
      this.enable = result.enable || false;
    });
    chrome.storage.local.get('enableScreenshot', (reslut) => {
      this.enableScreenshot = reslut.enableScreenshot || false;
    });
  }
}
</script>

<style lang="scss" scoped>
  .option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 230px;
    font-size: 16px;
    font-family: sans-serif;
    padding: 8px;
    &:first-child {
      border-bottom: 1px solid #ccc;
    }
  }
</style>