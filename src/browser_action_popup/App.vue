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
    <div v-show="enableScreenshot" class="option-item">
      <span>识别为：</span>
      <ul>
        <li 
          v-for="item in langs" 
          :key="item.code" 
          :class="{active: recognizeTo === item.code}"
          @click="setRecognizeLang(item.code)"
        >
          {{item.name}}
        </li>
      </ul>
    </div>
    <div v-show="enableScreenshot" class="option-item">
      <span>翻译为：</span>
      <ul>
        <li 
          v-for="item in langs" 
          :key="item.code" 
          :class="{active: recognizeTo === item.code}"
          @click="setRecognizeLang(item.code)"
        >
          {{item.name}}
        </li>
      </ul>
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
      langs: [
        {name: '简体中文', code: 'chi_sim'},
        {name: '英文', code: 'eng'},
        {name: '日文', code: 'jpn'}
      ],
      recognizeTo: 'eng',
      translateTo: 'zh'
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
    }
  },
  mounted() {
    chrome.storage.local.get('enable', (result) => {
      this.enable = result.enable || false;
    });
    chrome.storage.local.get('enableScreenshot', (reslut) => {
      this.enableScreenshot = reslut.enableScreenshot || false;
    });
    chrome.storage.local.get('recognizeTo', (result) => {
      this.recognizeTo = result.recognizeTo || 'eng';
    });
  },
  methods: {
    setRecognizeLang(code) {
      this.recognizeTo = code;
      chrome.storage.local.set({'recognizeTo': code});
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
    font-size: 16px;
    font-family: sans-serif;
    padding: 8px;
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
  }
</style>