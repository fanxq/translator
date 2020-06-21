import Vue from 'vue';
let _instance;
export default class MessageHub {
  constructor() {
    this.eventBus = new Vue();
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
        this.eventBus.$emit(request.messageId, request.result);
      }
    });
  }

  send(payload, timeout=10) {
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
          this.eventBus.$off(id);
          reject('timeout!');
        }
      }, timeout * 1000);
      this.eventBus.$once(id, (response) => {
        timer && clearTimeout(timer);
        let index = this.messeageIds.indexOf(id);
        if (index !== -1) {
          this.messeageIds.splice(index, 1);
        }
        resolve(response);
      });
    });
  }
 
}