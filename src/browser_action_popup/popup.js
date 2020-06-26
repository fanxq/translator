let checkbox = document.getElementById('cbx');
chrome.storage.local.get({'enable':true}, function(result){
    console.log(result);
    if(result.enable){
        checkbox.setAttribute('checked',true);
    }
});
checkbox.addEventListener('click',function(e){
    let target = e.target;
    if(target){
        if(target.checked){
            chrome.storage.local.set({'enable':true});
        }else{
            chrome.storage.local.set({'enable':false});
        }
    }
})
    