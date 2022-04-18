import translate from '../api/googleTranslateApi';
import { IResponse } from '../contentScripts/messageHub';
async function messageHandler(params: any) {
    let result: IResponse;
    try {
      switch (params.action) {
        case 'translate':
          const data = await translate(params.text, {from: params.from || 'auto', to: params.to || 'en'});
          result = { action: params.action, result:{ translation: data.text, srcLang: data.from.language.iso }};
          break;
        case 'captureScreen':
          const dataUrl = await chrome.tabs.captureVisibleTab({format: 'jpeg', quality: 100});
          result = { 
            action: params.action,
            result: dataUrl
          };
          break;
        default:
            result = {action: 'error', result: 'can not match the action'};
          break;
      }
    } catch (error) {
      result = { action: 'error', result: (error && (error as Error).message) || error };
    }
    return result;  
}
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request) {
      let messageId = request.messageId;
      let result = await messageHandler(request);
      messageId && (result.messageId = messageId);
      chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id ?? chrome.tabs.TAB_ID_NONE, result);
      });
    }
  });