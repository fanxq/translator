const Translate = require('google-translate-api');
const { createWorker } = require('tesseract.js');

const LANG_MAP = {
  'chi_sim': 'chi_sim+chi_sim_vert',
  'eng': 'eng',
  'jpn': 'jpn+jpn_vert'
};

let worker;
async function initTesseract(lang) {
  if (worker) {
    await worker.terminate();
  }
  worker = createWorker({
    workerPath: chrome.runtime.getURL("lib/worker.min.js"),
    langPath: chrome.runtime.getURL("traineddata"),
    corePath: chrome.runtime.getURL("lib/tesseract-core.wasm.js")
  });
  await worker.load();
  await worker.loadLanguage(LANG_MAP[lang]);
  await worker.initialize(lang);
}

window.reloadTesseract = initTesseract;

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
        console.log('bg:', JSON.stringify(params));
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
          result: result
        };
        break;
      case 'recognize':
        if (!worker) {
          let lang = await new Promise((resolve, reject) => {
            chrome.storage.local.get('recognizeTo', (result) => {
              resolve(result.recognizeTo || 'eng');
            });
          });
          await initTesseract(lang);
        }
        const { data: { text } } = await worker.recognize(params.screenshot);
        console.log(text);
        result = {
          action: params.action,
          result: text
        };
        // await worker.terminate();
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
    let messageId = request.messageId;
    let result = await messageHandler(request);
    messageId && (result.messageId = messageId);
    chrome.tabs.query({active: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, result);
    });
  }
});
