<template>
    <div ref="compRef" class="panel">
        <canvas
            ref="canvasRef" 
            :width="canvasWidth" 
            :height="canvasHeight"
            @mousedown="mouseDownHandler"
            @mousemove="mouseMoveHandler"
            @mouseup="mouseUpHandler"
        >
        </canvas>
        <el-dialog
            v-model="dialogVisible"
            :append-to-body="false"
            title="截图翻译"
            :width="600"
        >
            <el-scrollbar max-height="500px">
                <section class="capture-image-container">
                    <img :src="screenShotUrl" alt="截图">
                </section>
                <toolbar 
                    :show-logo="false"
                    :options="supportedLangList"
                    :disabled="dialogState.isRecongnizeDisabled"
                    class="toolbar"
                    @ok="recognize"
                >
                    <template v-slot:label>
                        <span>识别为</span>
                    </template>
                </toolbar>
                <textarea v-show="dialogState.showRecognizePanel" :class="['result-panel', dialogState.isRecognizing ? 'loading' : '']"  rows="10"></textarea>
                <toolbar :show-logo="false" :disabled="dialogState.isTranslateDisabled"/>
                <textarea v-show="dialogState.showTranslatePanel" :class="['result-panel', dialogState.isTranslating ? 'loading' : '']"  rows="10"></textarea>
            </el-scrollbar>
            
        </el-dialog>
    </div>
</template>
<script lang="ts" setup>
    import { ref, onMounted, reactive } from 'vue';
    import { Point } from '../model';
    import { ElMessage, ElDialog, ElScrollbar } from 'element-plus';
    import '../../../node_modules/element-plus/theme-chalk/el-message.css';
    import '../../../node_modules/element-plus/theme-chalk/el-dialog.css';
    import MessageHub from '../messageHub';
    import Toolbar from './Toolbar.vue';
    import { LangInfo } from '@/assets/config/languages';
    const canvasRef = ref<HTMLElement | null>(null);
    const compRef = ref<HTMLElement | null>(null);
    let ctx: CanvasRenderingContext2D | null = null;
    const canvasWidth = document.documentElement.offsetWidth;
    const canvasHeight = document.documentElement.offsetHeight;
    const defaultStyle = `url("${chrome.runtime.getURL('images/cut.png')}"), auto`;
    const cursorStyle = ref(defaultStyle);
    const screenShotUrl = ref('');
    const dialogVisible = ref(false);
    const dialogState = reactive({
        showRecognizePanel: true,
        isRecognizing: false,
        recognizedText: '',
        isRecongnizeDisabled: false,
        showTranslatePanel: true,
        isTranslating: false,
        isTranslateDisabled: false,
        translatedText: ''
    });
    const supportedLangList: LangInfo[] = [
        {
            name: '中文',
            code: 'zh-cn'
        },
        {
            name: '英文',
            code: 'en'
        }
    ];
    let isPressed = false;
    let startPos = new Point;
    const resetCanvas = () => {
        if (ctx) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.fillStyle = "rgba(128,128,128,0.5)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
    };
    const mouseUpHandler = async (e: MouseEvent) => {
        try {
            cursorStyle.value = defaultStyle;
            if (isPressed) {
                let width = Math.abs(e.offsetX - startPos.x);
                let height = Math.abs(e.offsetY - startPos.y);
                let x = Math.min(e.offsetX, startPos.x);
                let y = Math.min(e.offsetY, startPos.y);
                if (width <= 20 || height <= 20) {
                    ElMessage({
                        type: 'warning',
                        message: '所截图片尺寸过小，请重新截取！',
                        appendTo: compRef.value ?? undefined
                    });
                    resetCanvas();
                    isPressed = false;
                    return;
                }
                const dataUrl = await MessageHub.getInstance().send({action: 'captureScreen'});
                if (!dataUrl) {
                    throw new Error('未知异常');
                }
                let image = new Image();
                image.onload = () => {
                    console.log('width:', image.width, 'height:', image.height);
                    let canvas: HTMLCanvasElement | null = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    console.log(image.naturalWidth);
                    let scale = image.naturalWidth / canvasWidth;
                    let ctx = canvas.getContext('2d');
                    ctx?.drawImage(image, x * scale, y * scale, width  * scale, height * scale, 
                        0, 0, canvas.width, canvas.height);
                    screenShotUrl.value = canvas.toDataURL('image/png', 1);
                    dialogVisible.value = true;
                    canvas = null;
                };
                image.src = dataUrl as string;
            }
            
        } catch (error: any) {
            console.error(error);
            ElMessage({
                type: 'error',
                message: `获取截图失败：${error.message}`,
                appendTo: compRef.value ?? undefined
            });
        } finally {
            resetCanvas();
            isPressed = false;
        }
        
    };
    const mouseMoveHandler = (e: MouseEvent) => {
         if (isPressed) {
            cursorStyle.value = 'crosshair';
            let clipWidth = e.offsetX - startPos.x;
            let clipHeight = e.offsetY - startPos.y
            draw(clipWidth, clipHeight);
        }
    };
    const mouseDownHandler = (e: MouseEvent) => {
        console.log('mousedown');
        cursorStyle.value = 'crosshair';
        isPressed = true;
        startPos.x = e.offsetX;
        startPos.y = e.offsetY;
    };

    const draw = (rectW: number, rectH: number) => {
         if (ctx) {
            resetCanvas();
            let originalStartX = startPos.x
            let originalStartY = startPos.y;
            if (rectW < 0) {
                startPos.x = startPos.x + rectW;
                rectW = Math.abs(rectW);
            }
            if (rectH < 0) {
                startPos.y = startPos.y + rectH;
                rectH = Math.abs(rectH);
            }
            ctx.clearRect(startPos.x, startPos.y, rectW, rectH);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1;
            ctx.strokeRect(startPos.x, startPos.y, rectW, rectH);
            ctx.font = "12px Microsoft YaHei";
            ctx.fillStyle = "white";
            ctx.fillText(`${rectW}×${rectH}`, startPos.x, startPos.y - 2);
            startPos.x = originalStartX;
            startPos.y = originalStartY;
        }
    };

    const recognize = () => {

    }

    onMounted(() => {
        ctx = (canvasRef.value as HTMLCanvasElement).getContext('2d');
        resetCanvas();
    });
</script>
<style lang="less" scoped>
    .panel {
        position: relative;
        canvas {
            position: fixed;
            top: 0;
            left: 0;
            cursor: v-bind(cursorStyle);
        }
        .toolbar {
            margin: 8px auto;
            text-align: center;
            display: flex;
            justify-content: center;
        }

       .capture-image-container {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ccc;
            border-radius: 5px;
            height: 200px;
            img {
                object-fit: contain;
                max-height: 180px;
                max-width: 90%;
            }
        }

        .result-panel {
            width: 100%;
            resize: none;
            overflow: auto;
            background-color: #ccc;
            border-radius: 5px;
            border: none;
        }
        
    }
</style>