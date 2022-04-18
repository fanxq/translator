<template>
    <div :class="['result-panel', isLoading ? 'loading' : '']" :tips="tips">
        <div class="title">
            <logo />
            <h3>划词翻译</h3>
        </div>
        <div class="toolbar">
            <span>由</span>
            <el-select 
                class="select"
                v-model="sourceLangCode" 
                :teleported="false" 
                placeholder="选择源语言"
            >
                <el-option
                    v-for="item in options"
                    :key="item.code"
                    :label="item.name"
                    :value="item.code"
                />
            </el-select>
            <span>翻译为</span>
            <el-select 
                class="select"
                v-model="targetLangCode" 
                :teleported="false" 
                placeholder="选择目标语言"
            >
                <el-option
                    v-for="item in options"
                    :key="item.code"
                    :label="item.name"
                    :value="item.code"
                />
            </el-select>
            <el-button type="primary" @click="translateHandler">翻译</el-button>
        </div>
        <div class="output">
            {{store.state.translatedText}}
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref, computed } from 'vue';
    import Logo from './Logo.vue';
    import { LangInfoList } from '../../assets/config/languages';
    import { useStore } from '../store/index';
    const store = useStore();
    const sourceLangCode = ref('auto');
    const targetLangCode = ref('en');
    const options = ref(LangInfoList);
    const tips = ref('翻译中.');
    setInterval(() => {
        if (tips.value === '翻译中...') {
            tips.value = '翻译中.';
            return;
        }
        tips.value = tips.value + '.';
    }, 500);
    // const panel = ref<HTMLElement | undefined>(undefined);
    const isLoading = computed(() => store.state.isTranslating);
    // watch(() => store.state.isTranslating, (isLoading) => {
    //     console.log('loading', isLoading);
    // }, {immediate: true});

    const translateHandler = () => {
        console.log('translate');
    }
</script>
<style lang="less" scoped>
    .result-panel {
        user-select: none;
        &.loading {
            position: relative;
            &::before {
                position: absolute;
                content: attr(tips);
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                background-color: rgba(255, 255, 255, 0.8);
                z-index: 9;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
        .title {
            display: flex;
            align-items: center;
            h3 {
                margin: 0px 0px 0px 15px;
            }
        }
        .toolbar {
            display:flex;
            align-items: center;
            .select {
                margin: 0px 10px;
                :deep(.el-input__inner) {
                    width: 120px;
                    padding-right: 35px !important;
                }
            }
        }
    }
</style>