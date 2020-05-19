import extensionStyle from './css/style.css';

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static max(pointA, pointB) {
    if (pointA && pointB) {
      if (pointA instanceof Point && pointB instanceof Point) {
        if (pointA.y > pointB.y) {
          return pointA;
        } else if (pointA.y === pointB.y) {
          return pointA.x > pointB.y ? pointA : pointB;
        } else {
          return pointB;
        }
      } else {
        throw new Error('arguments must be a instance of Point');
      }
    } else {
      throw new Error('arguments cannot be empty!')
    }
  }
}

class TranslationExtension {
  constructor() {
    this.startPoint = new Point(0, 0);
    this.endPoint = new Point(0, 0);
    // this.selectedText = '';
    this.isMousedown = false;
    this.widget = null;
    this.widgetContent = null;
    this.init();
  }

  init() {
    this.initWidget();
    this.watchChromeRuntimeMessage();
    this.watchMousedownOnDocument();
    this.watchMouseupOnDocument();
  }

  initWidget() {
    this.widget = document.createElement('div');
    this.widget.style.display = 'none';
    let shadowRoot = this.widget.attachShadow({mode: 'open'});
    let style = document.createElement('style');
    style.textContent = extensionStyle.toString();
    shadowRoot.appendChild(style);
    this.widgetContent = document.createElement('div');
    this.widgetContent.setAttribute('class', 'popup');
    shadowRoot.appendChild(this.widgetContent);
    document.body.appendChild(this.widget);
  }

  showWidget(pos) {
    this.widget.style.display = 'block';
    this.widget.style.position = 'absolute';
    this.widget.style.top = `${pos.top}px`;
    this.widget.style.left = `${pos.left}px`;
    this.widgetContent.innerText = '翻译中......';
  }

  hideWidget() {
    if (this.widget) {
      this.widget.style.display = 'none';
    }
  }

  watchChromeRuntimeMessage() {
    let that = this;
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request && request.action === 'translate') {
        that.widgetContent.innerText = request.result;
      }
    });
  }

  watchMousedownOnDocument() {
    document.addEventListener('mousedown', (e) => {
      this.hideWidget();
      this.startPoint.x = e.pageX;
      this.startPoint.y = e.pageY;
      this.isMousedown = true;
    });
  }

  watchMousemoveOnDocument() {
    document.addEventListener('mousemove', (e) => {
      if (this.isMousedown) {
        this.endPoint.x = e.pageX;
        this.endPoint.y = e.pageY;
      }
    });
  }

  watchMouseupOnDocument() {
    document.addEventListener('mouseup', (e) => {
      if (this.isMousedown) {
        this.endPoint.x = e.pageX;
        this.endPoint.y = e.pageY;
        let selection = window.getSelection();
        let selectedText = selection ? selection.toString() : '';
        if (selectedText) {
          new Promise((resolve, reject) => {
            chrome.storage.local.get({
              'enable': true
            }, function (result) {
                resolve(result);
            });
          }).then(result => {
            if (!result.enable) { 
              return;
            }
            let pos = Point.max(this.startPoint, this.endPoint);
            this.showWidget({left: pos.x, top: pos.y});

            chrome.runtime.sendMessage({
              action: 'translate',
              text: selectedText.trim()
            });
          }).then(() => {
            this.startPoint = new Point(0, 0);
            this.endPoint = new Point(0, 0);
          });
        }
      }
      this.isMousedown = false;
      
    });
  }
}

export default TranslationExtension;