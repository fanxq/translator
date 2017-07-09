// function test(){
//     //alert("from background");
//     // var popups = chrome.extension.getViews({type:'popup'});
//     // var div = popups[0].document.createElement('div');
//     // div.textContent = "test";
//     // popups[0].document.body.append(div);
//     chrome.tabs.executeScript(null, {file:"scripts/ctx.js"});
// }

chrome.browserAction.onClicked.addListener(function(tab) {
	
	
	chrome.tabs.executeScript(null, {file:"jquery.min.js"});
	
	
	chrome.tabs.executeScript(null, {file:"ctx.js"});
});