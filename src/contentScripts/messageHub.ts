import mitt, {Emitter} from 'mitt';

// type Events = {
//     showCaptureToTranslate?: any;
//     captureScreen?: string;
// };
export interface IResponse {
    action: string,
    result?: any,
    messageId?: string
}

let _instance: MessageHub;
export default class MessageHub {
    emitter: Emitter<Record<string, unknown>>;
    private messeageIds: string[];
    constructor() {
        this.emitter = mitt();
        this.messeageIds = [];
        this.init();
    }

  static getInstance() {
    if (!_instance) {
      _instance = new MessageHub();
    }
    return _instance;
  }

  init() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request) {
        if (request.cmd === 'showCaptureToTranslate') {
          this.emitter.emit('showCaptureToTranslate');
          return;
        }
        this.emitter.emit(request.messageId, request);
      }
    });
  }

  send(payload: {action: string} & Record<string, unknown>, timeout = 10) {
    if (!payload) {
      throw new Error('payload cannot be empty!');
    }
    let timestamp = +new Date;
    let id = `msg-${timestamp}`;
    this.messeageIds.push(id);
    payload.messageId = id;
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(payload);
      let timer = setTimeout(() => {
        let index = this.messeageIds.indexOf(id);
        if (index !== -1) {
          this.messeageIds.splice(index, 1);
          this.emitter.off(id);
          reject('timeout!');
        }
      }, timeout * 1000);
      this.emitter.on(id, (response) => {
        timer && clearTimeout(timer);
        this.emitter.off(id);
        let index = this.messeageIds.indexOf(id);
        if (index !== -1) {
          this.messeageIds.splice(index, 1);
        }
        const res = (response as IResponse);
        if (res.action === 'error') {
          reject(res.result);
        }
        resolve(res.result);
      });
    });
  }
}