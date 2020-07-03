<template>
  <button  
    class="switch"
    :class="{ active: isActive }"
    :disabled="disabled"
    @click="toggle">
  </button>
</template>

<script>
export default {
  name: 'SwitchButton',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isActive(){
      let isActive = false;
      if (this.value) {
        isActive = true;
      }
      return isActive;
    }
  },
  methods: {
    toggle() {
      this.$emit('input', !this.value);
    }
  }
}
</script>

<style lang="scss" scoped>
$themeColor: #41b883;
.switch{
  height: 30px;
  width: 60px;
  border: 2px solid #ccc;
  border-radius: 15px;
  position: relative;
  background-color: transparent;
  outline: none;
  appearance: none;
  &::before{
    content: '';
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background-color: #b7b7b7;
    transition: left 0.3s ease;
  }
  &.active {
    border-color: $themeColor;
    &::before {
      border-color: $themeColor;
      background-color: $themeColor;
      left: calc(100% - 20px);
      transition: left 0.3s ease;
    }
  }
}
</style>