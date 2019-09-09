const Translate = require('google-translate-api');
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request) {
    if (request.action === 'translate' && request.text) {
      Translate(request.text, {
        from: 'auto',
        to: 'en'
      }).then(res => {
        console.log(res.text);
        console.log(res.from.language.iso);
        if (res.from.language.iso !== 'en') {
          return res.text;
        } else {
          return Translate(selectedText, {
            form: 'auto',
            to: 'zh-CN'
          }).then(res => {
            return res.text;
          });
        }
      }).catch(err => {
        console.log(err);
        return '翻译出错了！';
      }).then(function (res) {
        chrome.tabs.query({
          active: true,
          //currentWindow: true
        }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'translate',
            result: res
          });
        });
      });
    }
  }
});