export class Translate{
    constructor(){
        
    }
    ajax(url,method,params,header){
        return new Promise(function(resolve, reject){
            let xhr = new XMLHttpRequest();
            xhr.open(method,url);
            header && xhr.setRequestHeader(header.name, header.value);
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4 && xhr.status === 200){
                    resolve(xhr.response);
                }
            }
            xhr.onerror = function(){
                reject();
            }
            xhr.send(params);
        });
    }
    languageDetection(str){
        var self = this;
        return new Promise(function(resolve, reject){
            self.ajax('https://fanyi.baidu.com/langdetect','POST',`query=${encodeURIComponent(str)}`,{name:'Content-Type',value:'application/x-www-form-urlencoded'}).then(function(response){
                if(response){
                    var result = JSON.parse(response);
                    if(result.error === 0){
                        resolve({error:0,lan:result.lan});
                    }else{
                        reject({error:-1});
                    }  
                }else{
                    reject({error:-1});
                }
            }).catch(function(){
                reject({error:-1});
            });
        })
    }

     doTranslate(str){
        var self = this;
        return new Promise(function(resolve, reject){
            self.languageDetection(str).then(function(result){
                var targetLanguage = 'en';
                if(result && result.lan){
                    if(/zh/ig.test(result.lan)){
                        targetLanguage = 'en';
                    }else{
                        targetLanguage = 'zh-CN';
                    } 
                }
                var url = 'https://translate.google.cn/translate_a/single?client=gtx&sl=' + (result.lan || 'auto') + '&tl=' + (targetLanguage || 'auto') + '&hl=zh-CN&dt=t&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=' + str;
                self.ajax(url,'GET').then(function(res){
                    var rs = '';
                    if(res && typeof(res) === "string"){
                        var translateResult = JSON.parse(res);
                        var result = [];
                        translateResult.sentences.forEach(function (v) {
                            result.push(v.trans);
                        });
                        rs = result.join(',');
                    }
                    resolve(rs);
                }).catch(function(){
                    reject();
                });
            }).catch(function(){
                reject();
            })
        })
        
    }
}