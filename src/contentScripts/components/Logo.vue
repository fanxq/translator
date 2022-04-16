<template>
    <img class="logo" :src="logo" alt="logo">
</template>
<script setup lang="ts">
    import { defineProps, computed } from 'vue';
    const logo = chrome.runtime.getURL('images/icon128.png');
    const props = defineProps({
        size: {
            type: Number,
            default: 20
        }
    });
    const size = computed(() => `${props.size}px`);
</script>
<style scoped>
     .logo {
        width: v-bind(size);
        height: v-bind(size);
    }
</style>