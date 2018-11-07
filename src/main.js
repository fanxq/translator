import {Translate} from './translate.js';
let translator = new Translate();
let translationOutput = document.createElement('DIV');
translationOutput.style.display = 'none';
document.addEventListener("DOMContentLoaded",function(){
    document.body.appendChild(translationOutput);
    document.addEventListener("mousedown",function(e){
        if(translationOutput){
            if(translationOutput.style.display !== 'none'){
                translationOutput.style.display = 'none';
            }
        }
    });
    document.addEventListener("mouseup",function(e){
        new Promise(function(resolve,reject){
            chrome.storage.local.get({'enable':true}, function(result){
                resolve(result);
            });
        }).then(function(result){
            if(!result.enable){
                return;
            }
            var tPoint = {
                x:e.pageX,
                y:e.pageY
            }
            var selection = window.getSelection();
            if(selection){
                var selectedText = selection.toString();
                if(selectedText && selectedText.trim()){
                    if(translationOutput){
                        translationOutput.style.display = 'block';
                        translationOutput.style.position = 'absolute';
                        translationOutput.style.zIndex = '2147483647';
                        translationOutput.style.backgroundColor = 'white';
                        translationOutput.style.border = '1px solid rgba(0, 0, 0, 0.2)';
                        translationOutput.style.padding = '5px 5px';
                        translationOutput.style.top = tPoint.y - 40+'px';
                        translationOutput.style.left = tPoint.x+'px';
                        translationOutput.style.boxShadow = '3px 3px 3px rgba(0, 0, 0, 0.35)';
                        translationOutput.innerText = "翻译中......";
                        translator.doTranslate(selectedText).then(function(result){
                            if(result){
                                translationOutput.innerText = result;
                            }else{
                                translationOutput.innerText = '翻译出错了！';
                            }
                        }).catch(function(e){
                            translationOutput.innerText = '翻译出错了！';
                        });
                    }
                }
            }
        }); 
    });
});