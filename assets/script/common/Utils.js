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

    /**
     * md5加密
     *
     * @param {string} str
     * @returns
     */
    md5(str){
        if(str == null || typeof(str) != "string"){
            console.log("@@@md5:str error!");
            return "";
        }

        let CryptoJS = require('CryptoJS');
        let md5 = CryptoJS.MD5(str).toString();
        return md5;
    },

    /**
     * 按照Key值得字母顺序组装参数，去掉sign，{b:2, a:1} =>a=1&b=2
     *
     * @param {object} obj
     * @returns
     */
    objectToSortQuery(obj){
        if(obj == null || typeof(obj) != "object"){
            console.log("@@@build:obj error!");
            return "";
        }

        let keys = Object.keys(obj).sort();

        let str = "";
        for(let i = 0; i < keys.length; i++){
            if(keys[i] != "sign"){
                str = str + keys[i] + "=" + obj[keys[i]] + "&";
            }
        }

        if(str != ""){
            str = str.substring(0, str.length - 1);
        }

        console.log("@@@build:" + str);

        return str;
    },

    /**
     * {a:1, b:2} ==> a=1&b=2
     *
     * @param {*} obj
     */
    objectToQuery(obj){

    },

    /**
     * =1&b=2 ==> {a:1, b:2}
     *
     * @param {string} query - 入口参数
     * @returns
     */
    queryToObject(query){
        let obj = {};
        let querys = query.split("&");
        for(let i = 0; i < querys.length; i++){
            let str = querys[i].split("=");
            obj[str[0]] = str[1];
        }
        return obj;
    },

    /**
     *  获取入口参数
     *
     * @returns
     */
    getQuery()
    {
        var query = window.location.search.substring(1);
        if(query != null){
            return query;
        }
        else{
            return "";
        }
    },

    /**
     * 根据名称移除节点
     *
     * @param {string} name 节点名称
     */
    removeChildByName(name){
        if(typeof name != "string"){
            return false;
        }

        let child = cc.director.getScene().getChildByName(name);
        if(child != null){
            child.removeFromParent();
            return true;
        }

        return false;
    },


    /**
     * 根据预制名称添加节点
     *
     * @param {string} name 节点名称
     * @param {string} prefabName 预制名称
     * @param {number} zIndex 层级
     * @param {function(cc.Node)} callback 添加完回调
     */
    addChildByPrefabName(name, prefabName, zIndex, callback){
        if(name == null || typeof name != "string"){
            return false;
        }

        if(prefabName == null || typeof prefabName != "string"){
            return false;
        }

        if(zIndex == null || typeof zIndex != "number"){
            return false;
        }

        if(cc.director.getScene().getChildByName(name) != null){
            return false;
        }

        cc.loader.loadRes("prefab/" + prefabName, function (err, prefab) {
            var node = cc.instantiate(prefab);
            cc.director.getScene().addChild(node, zIndex, name);

            if(callback != null && typeof callback == "function"){
                callback(node);
            }
        });
    },


    /**
     * 显示Loading
     *
     * @param {string} msg 提示语
     * @param {function} callback 回调（防止未显示操作就完成）
     * @returns
     */
    addLoading(msg, callback){
        this.addChildByPrefabName("pgy_loading", "Loading", 100, function(node){
            if(msg != null && typeof msg == "string"){
                let jsLoading = node.getComponent("Loading");
                jsLoading.setText(msg);
            }

            if(callback != null && typeof callback == "function"){
                callback();
            }
        });
    },


    /**
     * 移除Loading
     *
     */
    removeLoading(){
        this.removeChildByName("pgy_loading");
    },


    /**
     * 添加消息框
     *
     * @param {string} msg 提示内容
     * @returns
     */
    addMsgBox(msg){
        this.addChildByPrefabName("pgy_msgBox", "MsgBox", 100, function(node){
            if(msg != null && typeof msg == "string"){
                let jsLoading = node.getComponent("MsgBox");
                jsLoading.setMsg(msg);
            }
        });
    },


    /**
     * 移除消息框
     *
     */
    removeMsgBox(){
        this.removeChildByName("pgy_msgBox");
    },


    /**
     * 添加输入昵称弹窗
     *
     * @param {*} callback
     * @returns
     */
    addNameInput(callback){
        this.addChildByPrefabName("pgy_nameInput", "NameInput", 100, function(node){
            if(msg != null && typeof msg == "string"){
                let jsNameInput = node.getComponent("NameInput");
                jsNameInput.submitCallback = callback;
            }
        });
    },


    /**
     * 移除输入昵称弹窗
     *
     */
    removeNameInput(){
        this.removeChildByName("pgy_nameInput");
    },


    /**
     * 播放背景音乐
     *
     */
    playMusic(){
        if(cc.pgy.cfg.audio){
            cc.loader.loadRes("texture/audio/background", cc.AudioClip, function (err, clip) {
                cc.audioEngine.playMusic(clip, true);
            });
        }
    },

    /**
     * 停止播放背景
     *
     */
    stopMusic(){
        cc.audioEngine.stopMusic();
    },

    
    /**
     * 播放音效
     *
     */
    playEffect(name){
        if(cc.pgy.cfg.audio){
            cc.loader.loadRes("texture/audio/" + name, cc.AudioClip, function (err, clip) {
                cc.audioEngine.play(clip, false);
            });
        }
    },

    
    /**
     * 时间戳转换成显示格式
     *
     * @param {*} timestamp
     * @returns
     */
    timestampToTime(timestamp){
        let date = new Date(timestamp);
        let time = date.getFullYear() + "-";
        time = time + (date.getMonth() + 1) + "-";
        time = time + date.getDate() + " ";
        time = time + date.getHours() + ":";
        time = time + date.getMinutes() + ":";
        time = time + date.getSeconds();

        return time;
    },

    // update (dt) {},
});
