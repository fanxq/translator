//const $ = require('jquery');
var google2baidu = {
    en: 'en',
    th: 'th',
    ru: 'ru',
    pt: 'pt',
    el: 'el',
    nl: 'nl',
    pl: 'pl',
    bg: 'bul',
    et: 'est',
    da: 'dan',
    fi: 'fin',
    cs: 'cs',
    ro: 'rom',
    sl: 'slo',
    sv: 'swe',
    hu: 'hu',
    de: 'de',
    it: 'it',
    zh: 'zh',
    'zh-CN': 'zh',
    'zh-TW': 'cht',
    'zh-HK': 'yue',
    ja: 'jp',
    ko: 'kor',
    es: 'spa',
    fr: 'fra',
    ar: 'ara'
};
function Translate(proxy){
    this.proxy = proxy||"";
    this.api = "baidu";
    this.targetLanguage="en";//默认转换成英文
    this.fromLanguage="zh";
    this.bLanguageDetection = true;

}

Translate.prototype.updateTranslate= function(str){
      //let doc = editor.document, str = doc.getText(editor.selection).trim();
      var self = this;
      return new Promise(function(resolve,reject){
        // if (str.trim() == '')
        // return;
        if (str.trim() == '')
        {resolve('');}
        
        setTimeout(function(){
            this.bLanguageDetection
                ? this.languageDetection(str, this.fromLanguage).then((detectResult) => {
                    if(detectResult.error === 0){
                        if(detectResult.lan == this.targetLanguage){
                            [this.fromLanguage, this.targetLanguage] = [this.targetLanguage, this.fromLanguage];
                        }
                    }
                    // if (isReverse.error !== 0) {
                    //     [this.fromLanguage, this.targetLanguage] = [this.targetLanguage, this.fromLanguage];
                    // }
                    this.dotranslate(encodeURIComponent(str), this.proxy, this.api, this.targetLanguage, this.fromLanguage).then((TResult)=>{
                        //console.log(result);
                        var rs = '', res = TResult;
                        if (this.api == 'baidu') {
                            if (res.error)
                                return;
                            rs = res.trans_result.data[0].dst;
                        }
                        else {
                            var result = [];
                            res.sentences.forEach(function (v) {
                                result.push(v.trans);
                            });
                            rs = result.join(',');
                        }
                        resolve(rs);
                    });
                })
                : this.dotranslate(encodeURIComponent(str), this.proxy, this.api, this.targetLanguage, this.fromLanguage).then((TResult)=>{
                        //console.log(result);
                        var rs = '', res = TResult;
                        if (this.api == 'baidu') {
                            if (res.error)
                                return;
                            rs = res.trans_result.data[0].dst;
                        }
                        else {
                            var result = [];
                            res.sentences.forEach(function (v) {
                                result.push(v.trans);
                            });
                            rs = result.join(',');
                        }
                        resolve(rs);
                    });
        }.bind(self), 1000);
      })
        
}

Translate.prototype.dotranslate = function(str, proxy, api, targetLanguage, fromLanguage){
    var translateStr = api == 'baidu' ? this.baiduTranslate(str, google2baidu[targetLanguage], google2baidu[fromLanguage]) : this.googleTranslate(str, targetLanguage, fromLanguage);
    var dtd = $.Deferred();
    $.ajax({
        url: translateStr,
        type: 'get',
        data: {"proxy":proxy}
    }).then(function(data){
        dtd.resolve(data);
    }, function(){
        //toastr.error("提交失败", "操作失败");
        dtd.reject();
    });
    return dtd.promise();
    // $.get(translateStr,{"proxy":proxy}).done(function(TResult){
    //     var rs = '', res = TResult;
    //     if (api == 'baidu') {
    //         if (res.error)
    //             return;
    //         rs = res.trans_result.data[0].dst;
    //     }
    //     else {
    //         var result = [];
    //         res.sentences.forEach(function (v) {
    //             result.push(v.trans);
    //         });
    //         rs = result.join(',');
    //     }
    //     // translateResult = rs;
    //     // alert(translateStr);
    //     //alert(rs);
    //     return rs;
    // });
}

Translate.prototype.languageDetection = function(str, fromLanguage){
    // return WebRequest.post('http://fanyi.baidu.com/langdetect', { "formData": { "query": str }, "timeout": 500 }).then(function (result) {
    //     var res = JSON.parse(result.content);
    //     if (res.error || res.lan == fromLanguage || fromLanguage == '') {
    //         return false;
    //     }
    //     else {
    //         return true;
    //     }
    // }, function () {
    //     return false;
    // });
    var self  = this;
    return $.post('https://fanyi.baidu.com/langdetect',{ "query": str , "timeout": 500 }).done(function(result) {
        var res = result;
        // if (res.error || res.lan == fromLanguage || fromLanguage == '') {
        //     return false;
        // }
        // else {
        //     return true;
        // }
        // if(res.error === 0){
        //     self.fromLanguage = res.lan;
        // }
        if(res.error !== 0|| res.lan == fromLanguage || fromLanguage == ''){
            return false;
        }else{
            
            return true;
        }
    })
    .fail(function() {
        return false;
    })
}

Translate.prototype.baiduTranslate = function(str, targetLanguage, fromLanguage){
    return 'http://fanyi.baidu.com/v2transapi?query=' + str + (fromLanguage ? '&from=' + fromLanguage : '') + (targetLanguage ? '&to=' + targetLanguage : '');
}

Translate.prototype. googleTranslate = function(str, targetLanguage, fromLanguage) {
    return 'https://translate.google.cn/translate_a/single?client=gtx&sl=' + (fromLanguage || 'auto') + '&tl=' + (targetLanguage || 'auto') + '&hl=zh-CN&dt=t&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=' + str;
}
$(function(){
    var translateIdle = new Translate();
   //console.log(window.location.href);
   var theCurTabUrl = window.location.href;
   if(theCurTabUrl.startsWith("https")){
       translateIdle.api = "google";
       //translateIdle.bLanguageDetection = false;
   }
   var resultDiv;
   document.onmousedown = function(e){
       if(resultDiv){
           if($(e.target).attr('id') != "translateResult"){
                $("#translateResult").hide();
           }
       }
   }
    document.onmouseup = function(e){
        var tPoint = {
            x:e.pageX,
            y:e.pageY
        }
        var selectObj = window.getSelection();
        if(selectObj){
            var selectedText = selectObj.toString();
            
            if(selectedText.trim() !== ""){
                if(resultDiv === undefined){
                    resultDiv = $("<div></div>");
                    $("body").css("position","relative");
                    resultDiv.css({
                        "padding":"5px",
                        "position":"absolute",
                        "z-index":"2147483647",
                        "background-color":"white",
                        "border":"1px solid rgba(0, 0, 0, 0.2)",
                        "box-shadow":"3px 3px 3px rgba(0, 0, 0, 0.35)"
                    });
                    resultDiv.attr("id","translateResult");
                    resultDiv.appendTo($("body"));
                }
               
                var bodyFontSize = $("body").css("font-size");
                // resultDiv.text(selectedText);
                var divHeight = parseInt(bodyFontSize)+20;
                resultDiv.css({
                    "top":tPoint.y - divHeight,
                    "left":tPoint.x
                });
                
                resultDiv.hide();
                translateIdle.updateTranslate(selectedText).then((result)=>{
                    resultDiv.text(result);
                    resultDiv.show();
                });
                //alert(selectedText);
            }
        }
    }
});
