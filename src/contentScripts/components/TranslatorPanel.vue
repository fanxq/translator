<template>
     <component :is='currentComponent' @toggle="toggleHandler"></component>
</template>
<script lang="ts">
    import { ref, defineComponent } from 'vue';
    import Toolbar from './Toolbar.vue';
    import ResultPanel from './ResultPanel.vue';
    export default defineComponent({
        components: {
            'toolbar': Toolbar,
            'result-panel': ResultPanel
        },
        setup() {
            const currentComponent = ref('toolbar');
            const toggleHandler = (compName: string) => {
                currentComponent.value = compName;
            };
            return {
                currentComponent,
                toggleHandler
            }
        }
    })
    
</script>
