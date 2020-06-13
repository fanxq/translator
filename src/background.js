const Translate = require('google-translate-api');

async function messageHandler(params) {
  let result;
  try {
    switch (params.action) {
      case 'translate':
        result = await Translate(params.text, {from: params.from || 'auto', to: params.to || 'en'});
        result = { action: params.action, result: result.text };
        break;
      case 'getSrcLang':
        result = await Translate(params.text, {from: 'auto', to: 'en'});
        result = { action: params.action, result: result.from.language.iso };
        break;
      case 'captureScreen':
        result = await new Promise((resolve, reject) => {
          chrome.tabs.captureVisibleTab(null, {
            format : "png",
            quality : 100
          }, (data) => {
            resolve(data);
          });
        });
        result = { 
          action: params.action,
          result: result,
          rect: {x: params.x, y: params.y, w: params.width, h: params.height} 
        };
        break;
      default:
        break;
    }
  } catch (error) {
    result = { action: params.action, result: error.message };
  }
  return result;  
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request) {
    let result = await messageHandler(request);
    chrome.tabs.query({active: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, result);
    });
  }
});