<template>
    <div class="panel">
        <img class="logo" :src="logo" alt="logo">
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
            <el-button type="primary">确定</el-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { ref } from 'vue';
    import { LangInfoList } from '../../assets/config/languages';
    const logo = chrome.runtime.getURL('images/icon128.png');
    const selectedLangCode = ref('en');
    const options = ref(LangInfoList);

</script>
<style lang="less" scoped>
    .panel {
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.2);
        display: inline-flex;
        align-items: center;
        font-size: 14px;
        color: #999;
        padding: 5px 10px;
        .logo {
            width: 20px;
            height: 20px;
            margin-right: 16px;
        }
        .toolbar {
            display:inline-flex;
            align-items: center;
            .select {
                margin: 0px 30px 0px 10px;
                :deep(.el-input__inner) {
                    width: 150px;
                    padding-right: 35px !important;
                }
            }
        }
        
    }
</style>