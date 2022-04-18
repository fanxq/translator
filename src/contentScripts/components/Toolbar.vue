<template>
   <div class="panel" >
        <logo v-if="props.showLogo"/>
        <div class="toolbar">
            <slot name="label"><span>翻译为</span></slot>
            <el-select 
                class="select"
                :disabled="props.disabled"
                v-model="selectedLangCode" 
                :teleported="false" 
                placeholder="选择目标语言"
            >
                <el-option
                    v-for="item in props.options"
                    :key="item.code"
                    :label="item.name"
                    :value="item.code"
                />
            </el-select>
            <el-button :disabled="props.disabled" type="primary" @click="okHandler">确定</el-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { ref, defineEmits, defineProps, PropType } from 'vue';
    import Logo from './Logo.vue';
    import { LangInfo, LangInfoList } from '../../assets/config/languages';
    import { useStore } from '../store/index';
    const store = useStore();
    const selectedLangCode = ref('en');
    const options = ref(LangInfoList);
    const props = defineProps({
        showLogo: {
            type: Boolean,
            default: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        options: {
            type: Array as PropType<LangInfo[]>,
            default: LangInfoList
        }
    });
    const emits = defineEmits<{ 
        (event: 'toggle', name: string): void;
        (event: 'ok', select: string): void;
     }>();
    const okHandler = async () => {
        store.action.getTranslation({});
        emits('toggle', 'result-panel');
        emits('ok', selectedLangCode.value);
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
                margin: 0px 10px 0px 8px;
                :deep(.el-input__inner) {
                    width: 120px;
                    padding-right: 35px !important;
                }
            }
        }
        
    }
</style>