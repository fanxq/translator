import MessageHub from '../content_scripts/messageHub';
let _instance;
export default class Cropper {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.screen.width;
    this.canvas.height = document.documentElement.clientHeight;
    this.canvas.style.position = 'fixed';
    this.canvas.style.left = '0px';
    this.canvas.style.top = '0px';
    this.canvas.style.display = 'none';
    this.canvas.style.zIndex = Number.MAX_SAFE_INTEGER;
    document.body.appendChild(this.canvas);
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.ctx = this.canvas.getContext('2d');
    this.pressed = false;
  }

  static getInstace() {
    if (!_instance) {
      _instance = new Cropper();
    }
    return _instance;
  }

  setCursorStyle(val) {
    this.canvas.style.cursor = val; 
  }

  onMouseDown(ev) {
    console.log('mousedown');
    this.setCursorStyle('crosshair');
    ev.stopPropagation();
    this.pressed = true;
    this.startX = ev.offsetX;
    this.startY = ev.offsetY;
  }

  onMouseMove(ev) {
    console.log('mousemove');
    if (this.pressed) {
      this.setCursorStyle('crosshair');
      let clipWidth = ev.offsetX - this.startX;
      let clipHeight = ev.offsetY - this.startY;
      this.draw(clipWidth, clipHeight);
    }
  }

  onMouseUp(ev) {
    console.log('mouseup');
    this.setCursorStyle('auto');
    if (this.pressed) {
      let width = Math.abs(ev.offsetX - this.startX);
      let height = Math.abs(ev.offsetY - this.startY);
      let x = Math.min(ev.offsetX, this.startX);
      let y = Math.min(ev.offsetY, this.startY);
      if (width <= 20 || height <= 20) {
        alert('所截图片尺寸过小，请重新截取！');
        this.resetCanvas();
        this.pressed = false;
        return;
      }
      MessageHub.getInstance().send({
        action: 'captureScreen',
      }).then(data => {
        let image = new Image();
        image.onload = () => {
          console.log('width:', image.width, 'height:', image.height);
          let canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          let scale = image.naturalWidth / this.canvas.width;
          let ctx = canvas.getContext('2d');
          ctx.drawImage(image, x * scale, y * scale, width * scale, height * scale, 0, 0, canvas.width, canvas.height);
          MessageHub.getInstance().eventBus.$emit('setScreenshot', canvas.toDataURL());
          canvas = null;
        };
        image.src = data;
      });
    }
    this.pressed = false;
  }

  // 重置画布
  resetCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(128,128,128,0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(rectW, rectH) {
    if (this.ctx) {
      this.resetCanvas();
      var originalStartX = this.startX;
      var originalStartY = this.startY;
      if (rectW < 0) {
          this.startX = this.startX + rectW;
          rectW = Math.abs(rectW);
      }
      if (rectH < 0) {
          this.startY = this.startY + rectH;
          rectH = Math.abs(rectH);
      }
      this.ctx.clearRect(this.startX, this.startY, rectW, rectH);
      this.ctx.strokeStyle = "red";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(this.startX, this.startY, rectW, rectH);
      this.ctx.font = "12px Microsoft YaHei";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(`${rectW}×${rectH}`, this.startX, this.startY-2);
      this.startX = originalStartX;
      this.startY = originalStartY;
    }
  }

  show() {
    this.canvas.style.display = 'block';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  hide() {
    this.canvas.style.display = 'none';
  }

}