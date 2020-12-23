import MessageHub from '../../content_scripts/messageHub';
import mixin from './mixin';
export default {
  mixins: [mixin],
  data() {
    return {
      canvasWidth: window.screen.width,
      canvasHeight: document.documentElement.clientHeight,
      pressed: false,
      startX: 0,
      startY: 0,
      ctx: null,
      cursorStyle: 'auto',
      isBtnShow: true,
      isTipsShow: false,
      tipsTop: 0,
      tipsLeft: 0,
      tipsWidth: 0,
      tipsHeight: 0,
      isShow: false,
      lineWidth: 1,
    }
  },
  mounted() {
    this.ctx = this.$refs.canvasOfCropper.getContext('2d');
  },
  methods: {
    show() {
      this.isShow = true;
      this.resetCanvas();
    },
    hide() {
      this.isShow = false;
    },
    mousedownHandler(ev) {
      console.log('mousedown');
      this.setCursorStyle('crosshair');
      ev.stopPropagation();
      this.pressed = true;
      this.startX = ev.offsetX;
      this.startY = ev.offsetY;
    },
    mouseupHandler(ev) {
      console.log('mouseup');
      this.setCursorStyle(`url("${chrome.runtime.getURL('images/cut.png')}"), auto`);
      if (this.pressed) {
        let width = Math.abs(ev.offsetX - this.startX);
        let height = Math.abs(ev.offsetY - this.startY);
        let x = Math.min(ev.offsetX, this.startX);
        let y = Math.min(ev.offsetY, this.startY);
        if (width <= 20 || height <= 20) {
          this.showMsg('所截图片尺寸过小，请重新截取！', 2000);
          this.resetCanvas();
          this.pressed = false;
          return;
        }
        this.hide();
        MessageHub.getInstance().send({
          action: 'captureScreen',
        }).then(data => {
          let image = new Image();
          image.onload = () => {
            console.log('width:', image.width, 'height:', image.height);
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let scale = image.naturalWidth / this.canvasWidth;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(image, x * scale, y * scale, width * scale, height * scale, 
              0, 0, canvas.width, canvas.height);
            MessageHub.getInstance().eventBus.$emit('setScreenshot', canvas.toDataURL('image/png', 1));
            canvas = null;
          };
          image.src = data;
        }).catch(err => {
          this.showMsg(`获取截图失败：${err}`);
        });
      }
      this.pressed = false;
    },
    mousemoveHandler(ev) {
      console.log('mousemove');
      if (this.pressed) {
        this.isTipsShow = false;
        this.isBtnShow = false;
        this.setCursorStyle('crosshair');
        let clipWidth = ev.offsetX - this.startX;
        let clipHeight = ev.offsetY - this.startY;
        this.draw(clipWidth, clipHeight);
      } else {
        this.setCursorStyle(`url("${chrome.runtime.getURL('images/cut.png')}") 12 10, auto`);
        if (!this.tipsHeight && !this.tipsWidth) {
          let rect = this.$refs.tips.getBoundingClientRect();
          this.tipsWidth = rect.width;
          this.tipsHeight = rect.height;
        }
        this.isBtnShow = true;
        const delta = 10;
        this.tipsLeft = `${ev.offsetX + this.tipsWidth + delta > this.canvasWidth ? ev.offsetX - delta - this.tipsWidth : ev.offsetX + delta}px`;
        this.tipsTop = `${ev.offsetY + this.tipsHeight + delta > this.canvasHeight ? ev.offsetY - delta - this.tipsHeight : ev.offsetY + delta}px`;
        this.isTipsShow = true;
      }
    },
    setCursorStyle(val) {
      this.cursorStyle = val; 
    },
    // 重置画布
    resetCanvas() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.fillStyle = "rgba(128,128,128,0.5)";
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    },
    draw(rectW, rectH) {
      if (this.ctx) {
        this.resetCanvas();
        let originalStartX = this.startX;
        let originalStartY = this.startY;
        if (rectW < 0) {
            this.startX = this.startX + rectW;
            rectW = Math.abs(rectW);
        }
        if (rectH < 0) {
            this.startY = this.startY + rectH;
            rectH = Math.abs(rectH);
        }
        this.ctx.clearRect(this.startX, this.startY, rectW, rectH);
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.strokeRect(this.startX, this.startY, rectW, rectH);
        this.ctx.font = "12px Microsoft YaHei";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(`${rectW}×${rectH}`, this.startX, this.startY-2);
        this.startX = originalStartX;
        this.startY = originalStartY;
      }
    },
  },
  render() {
    return (
      <section 
        class={['cropper', this.isShowMsg && 'show-msg']} 
        msg={this.msg}
        style={{display: this.isShow ? 'block' : 'none'}}
      > 
        <canvas 
          ref="canvasOfCropper"
          width={this.canvasWidth} 
          height={this.canvasHeight}
          style={{cursor: this.cursorStyle}}
          onMousedown={this.mousedownHandler}
          onMousemove={this.mousemoveHandler}
          onMouseup={this.mouseupHandler}
        ></canvas>
        <button 
          style={{display: this.isBtnShow ? 'block' : 'none'}}
          class="btn-close"
        >&times;</button>
        <span
          ref="tips"
          style={{
            display: this.isTipsShow ? 'inline-block' : 'none',
            top: this.tipsTop,
            left: this.tipsLeft
          }}
          class="tips"
        >您可以拖动鼠标进行截图或者点击右上角“X”按钮关闭该功能！</span>
      </section>
    );
  },
}