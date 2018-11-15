import {Translate} from './translate.js';
let translator = new Translate();
let translationOutput = document.createElement('DIV');
translationOutput.style.display = 'none';
document.addEventListener("DOMContentLoaded",function(){
    document.body.appendChild(translationOutput);
    let shadow = translationOutput.attachShadow({mode:'open'});
    let style = document.createElement("style");
    style.textContent = `
        .popup{
            font-size:14px;
            padding:5px 5px;
            position:relative;
            border:1px solid rgba(0, 0, 0, 0.2);
            box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.35);
            background-color: white;
        }
        .popup::after{
            content:'';
            position:absolute;
            left: 6px;
            top: -6px;
            width:10px;
            height:10px;
            transform: rotate(45deg);
            background-color: white;
            border-top:1px solid rgba(0, 0, 0, 0.2);
            border-left:1px solid rgba(0, 0, 0, 0.2);
        }
    `;
    shadow.appendChild(style);
    let output = document.createElement('div');
    output.setAttribute('class','popup');
    shadow.appendChild(output);
    document.addEventListener("mousedown",function(e){
        if(e.currentTarget == translationOutput){
            console.log('hit output');
            return;
        }
        if(translationOutput){
            if(translationOutput.style.display !== 'none'){
                translationOutput.style.display = 'none';
            }
        }
    });
    document.addEventListener("mouseup",function(e){
        if(e.currentTarget == translationOutput){
            console.log('hit output');
            return;
        }
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
                        translationOutput.style.top = tPoint.y + 10 + 'px';
                        translationOutput.style.left = tPoint.x+'px';
                        output.innerText = "翻译中......";
                        translator.doTranslate(selectedText).then(function(result){
                            if(result){ 
                                output.innerText  = result;
                            }else{
                                output.innerText = '翻译出错了！';
                            }
                        }).catch(function(e){
                            output.innerText = '翻译出错了！';
                        });
                    }
                }
            }
        }); 
    });
});