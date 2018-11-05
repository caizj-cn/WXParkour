// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    test(){
    },

    /**
     * post请求
     *
     * @param {object} param {url:(string)地址, header:(object)header参数, body:(object)body参数, callback:(function)回调}
     * @returns
     */
    post(param){
        return this._doRequest('POST', param);
    },

    /**
     * get请求
     *
     * @param {object} param {url:(string)地址, header:(object)header参数, body:(object)body参数, callback:(function)回调}
     * @returns
     */
    get(param){
        return this._doRequest('GET', param);
    },

    /**
     * 执行请求
     *
     * @param {string} method 请求方式, POST/GET
     * @param {object} param {url:(string)地址, header:(object)header参数, body:(object)body参数, callback:(function)回调}
     * @returns
     */
    _doRequest(method, param){
        // 合法性检查
        if(method == null){
            return null;
        }

        if(typeof(method) != "string"){
            return null;
        }

        if(!(method == "POST" || method == "GET")){
            return null;
        }

        let xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 10000;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                let response = xhr.responseText;
                if(param.callback != null && typeof param.callback == "function"){
                    param.callback(response);
                }
            }
        };

        xhr.ontimeout = function(){
            if(param.timeout != null && typeof param.timeout == "function"){
                param.timeout();
            }
        };

        xhr.open(method, param.url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        // 设置header
        if(param.header != null && typeof(param.header) == "object"){
            for(let key in param.header){
                xhr.setRequestHeader(key, param.header[key]);
            }
        }

        if(method == 'POST' && param.body != null && typeof(param.body) == "object"){
            xhr.send(JSON.stringify(param.body));
        }
        else{
            xhr.send();
        }

        return xhr;
    },

    // update (dt) {},
});
