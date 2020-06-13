const canvasId = 'TX-CANVAS-4-CROPPER';
let _instance;
export default class Cropper {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.canvas = document.createElement('canvas');
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;
    this.canvas.setAttribute('id', canvasId);
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

  onMouseDown(ev) {
    console.log('mousedown');
    this.pressed = true;
    this.startX = ev.offsetX;
    this.startY = ev.offsetY;
  }

  onMouseMove(ev) {
    console.log('mousemove');
    if (this.pressed) {
      let clipWidth = ev.offsetX - this.startX;
      let clipHeight = ev.offsetY - this.startY;
      this.draw(clipWidth, clipHeight);
    }
  }

  onMouseUp(ev) {
    console.log('mouseup');
    if (this.pressed) {
      chrome.runtime.sendMessage({
        action: 'captureScreen',
        width: Math.abs(ev.offsetX - this.startX),
        height: Math.abs(ev.offsetY - this.startY),
        x: Math.min(ev.offsetX, this.startX),
        y: Math.min(ev.offsetY, this.startY)
      });
    }
    this.pressed = false;
  }

  draw(rectW, rectH) {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "rgba(128,128,128,0.5)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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

  // destory() {
  //   this.canvas.removeEventListener('mousedown', this.onMouseDown, false);
  //   this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
  //   this.canvas.removeEventListener('mouseup', this.onMouseUp, false);
  // }
}