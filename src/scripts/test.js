window.onload = function(){
    var port;
    chrome.tabs.getSelected(null,function(currentWindow) {
            currentWindowId = currentWindow.id;
            port = chrome.tabs.connect(currentWindowId,{name: "fanyi"});
            port.postMessage({req: "connect"});
            port.onMessage.addListener(function(msg) {
            if (msg.res == "OK")
            {
                //alert("connect");
                console.log("connected!");
            }else if(msg.res == "turn on"){
                console.log("turn on");
            }
        });
	  });
    
   document.addEventListener('touchmove', function(e){}, false);
    var _switch   = document.getElementById("switch-1"), 
        switchHit = false,
        hasTouch  = false;
            
    function toggleHit(){ 
        if(!switchHit){ 
            switchHit = true;
             _switch.classList.add("hit"  );
        }
        if(_switch.checked){
            //alert("check!");
            if(port){
                port.postMessage({req:"transalte on"});
            }
        }
    }
    function setTouch() { if(!hasTouch) { hasTouch = true;  _switch.classList.add("touch"); }}
            
    _switch.onclick = toggleHit;
    _switch.ontouchstart = function(e){ setTouch(); e.preventDefault(); e.target.click(); }
}
