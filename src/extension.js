import extensionStyle from './css/style.css';
import Vue from 'vue';
const langs = require('../node_modules/google-translate-api/languages');

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
    this.widget.setAttribute('id', 'TX_SH_0001');
    let shadowRoot = this.widget.attachShadow({
      mode: 'open'
    });
    // let style = document.createElement('style');
    // style.textContent = extensionStyle.toString();
    // shadowRoot.appendChild(style);
    // this.widgetContent = document.createElement('div');
    // this.widgetContent.setAttribute('class', 'content');
    // shadowRoot.appendChild(this.widgetContent);
    // this.widget.addEventListener('mousedown', (e)=>{
    //   console.log('stop');
    //   e.stopPropagation();
    // });
    this.widgetContent = this.initWidgetContent();
    shadowRoot.appendChild(this.widgetContent.$mount().$el);
    document.body.appendChild(this.widget);
    extensionStyle.use(); // 延迟加载css
  }

  getLanguageSettingDialogComponet() {
    let langList = [];
    Object.keys(langs).forEach(x => {
      if (!~['isSupported', 'getCode'].indexOf(x)) {
        langList.push({code: x, name: langs[x]});
      }
    });
    return {
      props:{
        value: {
          type: String,
          require: true
        },
        show: {
          type: Boolean,
          default: false
        }
      },
      data() {
        return {
          langs: langList
        }
      },
      watch: {
        show(val) {
          if (val) {
            this.showDialog();
          } else {
            this.closeDialog();
          }
        }
      },
      methods: {
        onItemSeleted(code) {
          console.log(code);
          this.$emit('input', code);
        },
        showDialog() {
          this.$refs.dlg.showModal();
        },
        closeDialog() {
          this.$refs.dlg.close();
        },
        close() {
          this.$emit('update:show', false);
        }
      },
      render() {
        return (
        <dialog ref="dlg">
          <header>
            <h3>选择语言</h3>
            <button vOn:click={this.close} >关闭</button>
          </header>
          <section class="body">
            <ul>
              {
                this.langs.map(x => <li vOn:click={() => this.onItemSeleted(x.code)} class={x.code === this.value ? 'active' : ''}>{x.name}</li>)
              }
            </ul>
          </section>
        </dialog>)
      }
    }
  }
  initWidgetContent() {
    let dialogComponent = this.getLanguageSettingDialogComponet();
    return new Vue({
      components: {
        'set-lang-dialog': dialogComponent
      },
      data() {
        return {
          result: '翻译中......',
          langs: langs,
          defaultCode: 'en',
          disable: true,
          showDialog: false,
          direction: 'from',
          fromCode: 'auto',
          fromLang: 'Automatic',
          toCode: 'en',
          toLang: 'English',
          selectedText: ''
        }
      },
      methods: {
        setResult(res) {
          this.result = res;
        },
        noop() {
          console.log('stop click event');
        },
        openSelectLanguageDialog(direction) {
          this.showDialog = true;
          this.direction = direction;
          if (direction === 'to') {
            this.defaultCode = this.toCode;
          } else {
            this.defaultCode = this.fromCode;
          }
        },
        sendTranslateRequest() {
          chrome.runtime.sendMessage({
            action: 'translate',
            text: this.selectedText,
            from: this.fromCode,
            to: this.toCode
          });
        },
        setSelectedText(text) {
          this.selectedText = text;
        }
      },
      watch: {
        defaultCode(val) {
          console.log(val);
          if (this.direction === 'to') {
            this.toLang = langs[val];
            this.toCode = val;
          } else {
            this.fromCode = val;
            this.fromLang = langs[val];
          }
        },
       
      },
      render() {
        return <div class="content" vOn:mousedown_stop={this.noop}>
          <div class="toolbar">
            <button class="btn" vOn:click={() => this.openSelectLanguageDialog('from')}>{this.fromLang}</button>
            <span style="font-size:20px;">&#8407;</span>
            <button class="btn" vOn:click={() => this.openSelectLanguageDialog('to')}>{this.toLang}</button>
            <button class="btn" vOn:click={ this.sendTranslateRequest }>翻译</button>
          </div>
          <div>{this.result}</div>
          <set-lang-dialog show={this.showDialog} {...{on:{'update:show':(val) => this.showDialog = val}}} vModel={this.defaultCode}></set-lang-dialog>
        </div>
      }
    });
  }

  showWidget(pos) {
    this.widget.style.display = 'block';
    this.widget.style.position = 'absolute';
    this.widget.style.top = `${pos.top}px`;
    this.widget.style.left = `${pos.left}px`;
    // this.widgetContent.innerText = '翻译中......';
    this.widgetContent.setResult('翻译中......');
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
        // that.widgetContent.innerText = request.result;
        that.widgetContent.setResult(request.result);
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
        this.widgetContent.setSelectedText(selectedText);
        let left = this.endPoint.x - (this.endPoint.x -this.startPoint.x) / 2 - 6;
        let top = this.endPoint.y + parseInt(this.getFontsizeOfSelectedText(selection), 10);
        this.showWidget({
          left: left,
          top: top
        });

        // chrome.runtime.sendMessage({
        //   action: 'translate',
        //   text: selectedText
        // });
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