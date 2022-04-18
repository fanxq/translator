import { defineCustomElement } from 'vue';
import { VisibleType, Point } from './model';
import Widget from './Widget.ce.vue';

const MaxWidgetWidth = 350;



export default class Extension {
    private startPoint: Point;
    private endPoint: Point;
    private isMousedown: boolean;
    private isSelected: boolean;
    private translatorWidget: HTMLElement | null;
    private selectedText: string;
    private selectedRange: Range | null;
    constructor() {
        this.startPoint = new Point;
        this.endPoint = new Point;
        this.translatorWidget = null;
        this.isMousedown = false;
        this.isSelected = false;
        this.selectedText = '';
        this.selectedRange = null;
        this.init();
    }

    private init() {
        this.initWidget();
        document.addEventListener('mousedown', this.mouseDownHandler.bind(this));
        document.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
        document.addEventListener('mouseup', this.mouseUpHandler.bind(this));
    }

    private initWidget() {
        const TranslatorWidget = defineCustomElement(Widget);
        customElements.define('translator-widget', TranslatorWidget);
        this.translatorWidget = new TranslatorWidget();
        // this.injectStyleToWidget();
        // this.translatorWidget.style.display = 'none';
        document.body.appendChild(this.translatorWidget);
        this.injectStyleToWidget();
        this.translatorWidget.addEventListener('mousedown', (ev) => {
            ev.stopPropagation();
        }, false);
        this.translatorWidget.addEventListener('focus', (ev) => {
            // console.log('focus-------');
            // console.log('range', this.selectedRange);
            if (this.selectedRange) {
                let selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(this.selectedRange);
            }
        });
    }

    private injectStyleToWidget() {
        document.head.querySelectorAll('style[data-tag="mystyle"]').forEach(style => {
            style.textContent = style.textContent?.replace(/:root/igm, ':host')??null;
            this.translatorWidget?.shadowRoot?.appendChild(style);
        });
    }

    private mouseDownHandler(e: MouseEvent) {
        (this.translatorWidget as any).visible = VisibleType.NONE;
        this.isSelected = false;
        this.isMousedown = true;
    }

    private mouseMoveHandler(e: MouseEvent) {
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
    }

    private mouseUpHandler(e: MouseEvent) {
        if (!this.isSelected) {
            return;
        }
        let selection = window.getSelection();
        let selectedText = selection ? selection.toString().trim() : '';
        if (!selectedText) {
            return;
        }
        this.selectedRange = selection?.getRangeAt(0) ?? null;
        const widget = (this.translatorWidget as any);
        widget.selectedText = selectedText;
        let left = this.endPoint.x - (this.endPoint.x -this.startPoint.x) / 2 - 6;
        const clientWidth = document.documentElement.clientWidth;
        if ((left + MaxWidgetWidth) > clientWidth) {
            left = clientWidth - MaxWidgetWidth;
        }
        let top = this.endPoint.y;
        const anchorNode = selection?.anchorNode;
        const focusNode = selection?.focusNode; 
        if (anchorNode && focusNode) {
            let anchorElement = anchorNode;
            let focusElement = focusNode;
            if (anchorNode.nodeType === Node.TEXT_NODE && anchorNode.parentElement) {
                anchorElement = anchorNode.parentElement;
            }
            if (focusNode.nodeType === Node.TEXT_NODE && focusNode.parentElement) {
                focusElement = focusNode.parentElement;
            }
            if (anchorNode.nodeType === Node.TEXT_NODE && focusNode.nodeType === Node.TEXT_NODE) {
                top = top + parseInt(window.getComputedStyle(focusElement as HTMLElement).fontSize, 10);
            } else {
                top = Math.max(this.getOffsetToBody(anchorElement).bottom, this.getOffsetToBody(focusElement).bottom);
            }
        }
        widget.pos = new Point(left, top);
        //widget.visible = VisibleType.SHOW_TRANSLATOR_PANEL;
        widget.visible = VisibleType.SHOWM_SCREEN_CAPTURE_COMP;
        this.startPoint = new Point(0, 0);
        this.endPoint = new Point(0, 0);
        this.isMousedown = false;
        this.isSelected = false;
        this.selectedText = '';
    }

    private getOffsetToBody(element: Node) {
        let rect = (element as HTMLElement).getBoundingClientRect();
        let scrollLeft = (document.documentElement || document.body.parentNode || document.body).scrollLeft;
        let scrollTop = (document.documentElement || document.body.parentNode || document.body).scrollTop;
        return {
          bottom: rect.bottom + scrollTop,
          left: rect.left + scrollLeft
        }
      }
}