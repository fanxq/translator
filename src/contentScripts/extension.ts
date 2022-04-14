import { defineCustomElement } from 'vue';
import Widget from './components/Widget.ce.vue';

class Point {
    public x:number;
    public y:number;
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export default class Extension {
    private startPoint: Point;
    private endPoint: Point;
    private translatorWidget: HTMLElement | null;
    constructor() {
        this.startPoint = new Point;
        this.endPoint = new Point;
        this.translatorWidget = null;
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
        console.log('custom', customElements);
        window.customElements.define('translator-widget', TranslatorWidget);
        this.translatorWidget = new TranslatorWidget();
        // this.injectStyleToWidget();
        // this.translatorWidget.style.display = 'none';
        document.body.appendChild(this.translatorWidget);
        this.injectStyleToWidget();
    }

    private injectStyleToWidget() {
        document.head.querySelectorAll('style[data-tag="mystyle"]').forEach(style => {
            style.textContent = style.textContent?.replace(/:root/igm, ':host')??null;
            this.translatorWidget?.shadowRoot?.appendChild(style);
        });
    }

    private mouseDownHandler(e: MouseEvent) {

    }

    private mouseMoveHandler(e: MouseEvent) {

    }

    private mouseUpHandler(e: MouseEvent) {

    }
}