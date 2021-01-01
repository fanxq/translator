import extensionStyle from '../assets/scss/global.scss';
import Vue from 'vue';
import translatePanel from '../components/translatePanel';
import MessageHub from './messageHub';
import imageTranslateDialog from '../components/imageTranslateDialog/index';

let _extensionHostElement = null;

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

class TranslatorExtension {
  constructor() {
    this.startPoint = new Point(0, 0);
    this.endPoint = new Point(0, 0);
    this.selectedText = '';
    this.isSelected = false;
    this.isMousedown = false;
    this.widget = null;
    this.translatePanel = null;
    this.init();
  }

  static getExtensionHostElement() {
    return _extensionHostElement;
  }

  init() {
    this.initWidget();
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
    this.widget.setAttribute('id', 'TX_SH_0001');
    this.widget.addEventListener('mousedown', (ev) => {
      ev.stopPropagation();
    }, false);
    let shadowRoot = this.widget.attachShadow({
      mode: 'open'
    });
    
    this.translatePanel = this.initTranslatePanel();
    shadowRoot.appendChild(this.translatePanel.$mount().$el);
    document.body.appendChild(this.widget);
    _extensionHostElement = this.widget;
    extensionStyle.use(); // 延迟加载css
  }

  initTranslatePanel() {
    let self = this;
    Vue.use(imageTranslateDialog);
    return new Vue({
      components: {
        'translate-panel': translatePanel
      },
      data() {
        return {
          selectedText: '',
        }
      },
      computed: {
        showPanel() {
          let showCropper = MessageHub.getInstance().store.showCropper;
          let showPanel = !showCropper;
          if (showCropper) {
            self.showWidget({left: 0, top: 0});
          } else {
            self.hideWidget();
          }
          return showPanel;
        }
      },
      methods: {
        setSelectedText(val) {
          this.selectedText = val;
        }
      },
      render() {
        if (this.showPanel) {
          return (<translate-panel selectedText={this.selectedText}></translate-panel>);
        }
      }
    });
  }

  showWidget(pos) {
    const translatePanelWidth = 320;
    const translatePanelHeight = 200;
    const margin = 20; 
    this.widget.style.display = 'block';
    this.widget.style.position = 'absolute';
    let scrollWidth = (document.documentElement || document.body.parentNode || document.body).scrollWidth;
    let scrollHeight = (document.documentElement || document.body.parentNode || document.body).scrollHeight;
    if ((pos.left + translatePanelWidth) > scrollWidth) {
      pos.left = scrollWidth - translatePanelWidth - margin;
    }
    if ((pos.top + translatePanelHeight) > scrollHeight) {
      pos.top = scrollHeight - translatePanelHeight - margin;
    }
    this.widget.style.top = `${pos.top}px`;
    this.widget.style.left = `${pos.left}px`;
    // widget显示时，发送消息通知translatePanel,translatePanel监听该消息并在消息触发时进行相应的修改
    MessageHub.getInstance().eventBus.$emit('refresh-panel'); 
  }

  hideWidget() {
    if (this.widget && !MessageHub.getInstance().store.showCropper) {
      this.widget.style.display = 'none';
      if (this.translatePanel) {
        this.translatePanel.setSelectedText('');
      }
    }
  }

  watchMousedownOnDocument() {
    document.addEventListener('mousedown', (e) => {
      this.hideWidget();
      this.isSelected = false;
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
          'enable': false
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
        this.translatePanel.setSelectedText(selectedText);
        let left = this.endPoint.x - (this.endPoint.x -this.startPoint.x) / 2 - 6;
        let top = this.endPoint.y + parseInt(this.getFontsizeOfSelectedText(selection), 10);
        
        this.showWidget({
          left: left,
          top: top
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

export default TranslatorExtension;