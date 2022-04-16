<template>
   <div class="panel" >
        <logo/>
        <div class="toolbar">
            <span>翻译为</span>
            <el-select 
                class="select"
                v-model="selectedLangCode" 
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
            <el-button type="primary" @click="okHandler">确定</el-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { ref, defineEmits } from 'vue';
    import Logo from './Logo.vue';
    import { LangInfoList } from '../../assets/config/languages';
    import { useStore } from '../store/index';
    const store = useStore();
    const selectedLangCode = ref('en');
    const options = ref(LangInfoList);
    const emits = defineEmits<{ (event: 'toggle', name: string): void }>();
    const okHandler = async () => {
        store.action.getTranslation({});
        emits('toggle', 'result-panel');
        // alert(store.state.selectedText);
        // const text = store.state.selectedText;
        // const result = await translate(text, {from:'auto', to: 'en'});
        // if (result) {
        //     alert(result.text);
        // }
    };
    
</script>
<style lang="less" scoped>
    .panel {
        display: inline-flex;
        align-items: center;
        font-size: 14px;
        color: #999;
        user-select: none;
       
        .toolbar {
            display:inline-flex;
            align-items: center;
            margin-left: 15px;
            .select {
                margin: 0px 30px 0px 8px;
                :deep(.el-input__inner) {
                    width: 150px;
                    padding-right: 35px !important;
                }
            }
        }
        
    }
</style>