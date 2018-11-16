import {Translate} from './translate.js';
let startX = 0; let startY = 0;
let endX = 0; let endY = 0;
let selectedText;
let isMouseDown = false;
let isSelected = false;
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
        if(translationOutput){
            if(translationOutput.style.display !== 'none'){
                translationOutput.style.display = 'none';
            }
        }
        isMouseDown = true;
    });
    document.addEventListener('mousemove',function(e){
        if(isMouseDown){
            var selObj = window.getSelection();
            if(!isSelected && selObj){
                endX = startX = e.pageX;
                endY = startY = e.pageY;
                isSelected = true;
                selectedText = selObj.toString();
                return;
            }
            if(isSelected && selObj){
                if(selObj.toString() === selectedText){
                    return;
                }
                endX = e.pageX;
                endY = e.pageY;
                selectedText = selObj.toString();
                console.log("x:",endX,"y2:",endY,"text:",selectedText);
            }
        }
    },false);
    document.addEventListener("mouseup",function(e){
        if(!isSelected){
            return;
        }
        let fontSize = 14;
        try{ 
			fontSize = window.getComputedStyle(window.getSelection().anchorNode.nodeType == 3?window.getSelection().anchorNode.parentElement:window.getSelection().anchorNode).fontSize;
		}catch(e){
			console.log(e);
        }
        var left = endX - (endX - startX)/2 - 6;
		var top = Math.max(endY, startY) + parseInt(fontSize);
        new Promise(function(resolve,reject){
            chrome.storage.local.get({'enable':true}, function(result){
                resolve(result);
            });
        }).then(function(result){
            if(!result.enable){
                return;
            }
            // var tPoint = {
            //     x:e.pageX,
            //     y:e.pageY
            // }
            var selection = window.getSelection();
            if(selection){
                var selectedText = selection.toString();
                if(selectedText && selectedText.trim()){
                    if(translationOutput){
                        translationOutput.style.display = 'block';
                        translationOutput.style.position = 'absolute';
                        translationOutput.style.zIndex = '2147483647';
                        // translationOutput.style.top = tPoint.y + 10 + 'px';
                        // translationOutput.style.left = tPoint.x+'px';
                        translationOutput.style.top = top + 'px';
                        translationOutput.style.left = left + 'px';
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
        isMouseDown = false;
        selectedText = '';
        isSelected = false;
        //startX = startY = endX = endY = 0; 
    });
});