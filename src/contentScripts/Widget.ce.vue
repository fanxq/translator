<template>
    <div class="widget" v-if="props.visible == VisibleType.SHOW_TRANSLATOR_PANEL">
         <translator-panel />
    </div>
    <div v-if="props.visible == VisibleType.SHOWM_SCREEN_CAPTURE_COMP">
        <div class="screen-capture"></div>
    </div>
</template>
<script lang="ts" setup>
    import {  defineProps, PropType, computed, watch } from 'vue';
    import { VisibleType } from './model';
    import { useStore } from './store/index';
    import TranslatorPanel from './components/TranslatorPanel.vue';
    // import Toolbar from './components/Toolbar.vue';

    interface IPoint {
        x: number,
        y: number
    }

    const store = useStore();
    const props = defineProps({
        visible: {
            type: Number,
            default: VisibleType.NONE
        },
        pos: {
            type: Object as PropType<IPoint>,
            default: {x: 0, y: 0}
        },
        selectedText: {
            type: String,
            default: ''
        }
    });
    const left = computed(() => {
        return `${props.pos.x}px`;
    });
    const top = computed(() => {
        return `${props.pos.y}px`;
    });

    watch(() => props.selectedText, (selectedText) => {
        store.action.updateSelectedText(selectedText);
    });
    watch(() => props.visible, (visible) => {
        console.log('visible', visible);
    })
</script>
<style>
    .widget {
        padding: 8px;
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.2);
        position: absolute;
        left: v-bind(left);
        top: v-bind(top);
    }
    .screen-capture {
        position: fixed;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.2);
        top: 0px;
        left: 0px;
    }
</style>