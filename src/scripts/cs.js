
  chrome.extension.onConnect.addListener(function(port) {
        console.assert(port.name == "fanyi");
        port.onMessage.addListener(function(msg) {
            if (msg.req == "connect"){
                 port.postMessage({res: "OK"});
            }
            else if (msg.req == "transalte on"){
                port.postMessage({res:"turn on"});
            }
            else if (msg.answer == "Madame... Bovary")
            port.postMessage({question: "I don't get it."});
        });
    });