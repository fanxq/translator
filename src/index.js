window.onload = function(){
    var state = localStorage.getItem("switchState");//查询switch的状态
    var _switch   = document.getElementById("switch-1"), 
        switchHit = false,
        hasTouch  = false;
    document.addEventListener('touchmove', function(e){}, false);   
    function toggleHit(){ 
        if(!switchHit){ 
            switchHit = true;
            _switch.classList.add("hit");
        }
        if(_switch.checked){
            //alert("check!");
            localStorage.setItem("switchState","on");
            chrome.tabs.executeScript(null, {file:"jquery.min.js"});
            chrome.tabs.executeScript(null, {file:"ctx.js"});
        }
        else{
            localStorage.setItem("switchState","off");
            chrome.tabs.executeScript(null, {code:"document.onmouseup = null;"});
        }
    }
    function setTouch() { if(!hasTouch) { hasTouch = true;  _switch.classList.add("touch"); }}
            
    _switch.onclick = toggleHit;
    _switch.ontouchstart = function(e){ setTouch(); e.preventDefault(); e.target.click(); }
    if(state){
        if(state == "on"){
            //状态为on时，dom元素设置样式（打开开关）
            _switch.click();
        }else{

        }
    }
}