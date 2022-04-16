<template>
    <div ref="panel" class="result-panel">
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
            <el-button type="primary" @click="okHandler">翻译</el-button>
        </div>
        <div class="output">
            {{store.state.translatedText}}
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref, computed, watch, nextTick } from 'vue';
    import { ElLoading } from 'element-plus';
    import Logo from './Logo.vue';
    import { LangInfoList } from '../../assets/config/languages';
    import { useStore } from '../store/index';
    const store = useStore();
    const sourceLangCode = ref('auto');
    const targetLangCode = ref('en');
    const options = ref(LangInfoList);
    const panel = ref<HTMLElement | undefined>(undefined);
    const isLoading = computed(() => store.state.isTranslating);
    watch(() => isLoading, (_isLoading) => {
        let loadingInstance: any = null;
        if (_isLoading) {
          loadingInstance =  ElLoading.service({target: panel.value});
        } else {
            nextTick(() => {
                if (loadingInstance) {
                    loadingInstance.close()
                }
            });
        }
    });
</script>
<style lang="less" scoped>
    .result-panel {
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