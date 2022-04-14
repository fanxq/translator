<template>
    <section class="layout">
        <el-button type="primary">test</el-button>
        <div>{{msg}}</div>
    </section>
</template>
<script setup lang="ts">
    import {ref} from 'vue';
    const msg = ref('hello');

</script>
<style>
    .layout {
        width: 250px;
        height: 300px;
        background-color: #eee;
    }
</style>