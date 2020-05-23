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
    this.selectedText = '';
    this.isSelected = false;
    this.isMousedown = false;
    this.widget = null;
    this.widgetContent = null;
    this.init();
  }

  init() {
    this.initWidget();
    this.watchChromeRuntimeMessage();
    this.watchMousedownOnDocument();
    this.watchMousemoveOnDocument();
    this.watchMouseupOnDocument();
  }

  initWidget() {
    this.widget = document.createElement('div');
    this.widget.style.display = 'none';
    this.widget.style.backgroundColor = '#fff';
    this.widget.style.boxShadow = '0 2px 10px 0 rgba(0, 0, 0, 0.2)';
    this.widget.style.borderRadius = '5px';
    this.widget.style.zIndex = Number.MAX_SAFE_INTEGER;
    let shadowRoot = this.widget.attachShadow({
      mode: 'open'
    });
    let style = document.createElement('style');
    style.textContent = extensionStyle.toString();
    shadowRoot.appendChild(style);
    this.widgetContent = document.createElement('div');
    this.widgetContent.setAttribute('class', 'content');
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
      this.isMousedown = true;
    });
  }

  watchMousemoveOnDocument() {
    document.addEventListener('mousemove', (e) => {
      if (this.isMousedown) {
       
        let selection = window.getSelection();
        let selectedText = selection ? selection.toString() : '';
        if (!this.isSelected && selectedText) {
          this.startPoint.x = e.pageX;
          this.startPoint.y = e.pageY;
          this.endPoint.x = e.pageX;
          this.endPoint.y = e.pageY;
          this.isSelected = true;
          this.selectedText = selectedText;
        }
        if (this.isSelected && selectedText) {
          if (selectedText === this.selectedText) {
            return;
          }
          this.endPoint.x = e.pageX;
          this.endPoint.y = e.pageY;
          this.selectedText = selectedText;
        }
      }
    });
  }

  getOffsetToBody(element) {
    let rect = element.getBoundingClientRect();
    let scrollLeft = (document.documentElement || document.body.parentNode || document.body).scrollLeft;
    let scrollTop = (document.documentElement || document.body.parentNode || document.body).scrollTop;
    return {
      bottom: rect.bottom + scrollTop,
      left: rect.left + scrollLeft
    }
  }

  getFontsizeOfSelectedText(selection) {
    let fontSize = 14;
    try {
      fontSize = window.getComputedStyle(selection.focusNode.nodeType === Node.TEXT_NODE ? selection.focusNode.parentNode : selection.focusNode).fontSize;
    } catch (error) {
      console.log(error.message);
    }
    return fontSize;
  }
  watchMouseupOnDocument() {
    document.addEventListener('mouseup', (e) => {
      if (!this.isSelected) {
        return;
      }
      
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
        let selection = window.getSelection();
        let selectedText = selection ? selection.toString().trim() : '';
        if (!selectedText) {
          return;
        }
        
        // let anchorOffsetToBody = this.getOffsetToBody(selection.anchorNode.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentNode : selection.anchorNode);
        // let focusOffsetToBody = this.getOffsetToBody(selection.focusNode.nodeType === Node.TEXT_NODE ? selection.focusNode.parentNode : selection.focusNode);
        // let anchorPos = new Point(anchorOffsetToBody.left, anchorOffsetToBody.bottom);
        // let focusPos = new Point(focusOffsetToBody.left, focusOffsetToBody.bottom);
        // let pos = Point.max(anchorPos, focusPos);
        let left = this.endPoint.x - (this.endPoint.x -this.startPoint.x) / 2 - 6;
        let top = this.endPoint.y + parseInt(this.getFontsizeOfSelectedText(selection), 10);
        this.showWidget({
          left: left,
          top: top
        });

        chrome.runtime.sendMessage({
          action: 'translate',
          text: selectedText
        });
      }).then(() => {
        this.startPoint = new Point(0, 0);
        this.endPoint = new Point(0, 0);
        this.isMousedown = false;
        this.isSelected = false;
        this.selectedText = '';
      });
    });
  }
}

export default TranslationExtension;