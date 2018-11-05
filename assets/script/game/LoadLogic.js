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
        progressBar: {
            default: null,
            type: cc.ProgressBar,
            tooltip: "加载进度"
        },

        labelProgress: {
            default: null,
            type: cc.Label,
            tooltip:"加载进度"
        },

        spriteCat: {
            default: null,
            type: cc.Sprite,
            tooltip: "猫"
        },

        _progress: {
            default: 0,
            visible: false,
            tooltip: "进度"
        },

        _isLoading: {
            default: false,
            tooltip: "是否正在加载"
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.initMgr();
        this.startPreload();
    },

    update (dt) {
        // 更新资源加载进度
        if(this._isLoading){
            this.labelProgress.string = Math.floor(this._progress * 100);
            this.progressBar.progress = this._progress;
            let width = this.progressBar.node.width;
            this.spriteCat.node.x = this.progressBar.node.x - (width >> 1) + this._progress * width;
        }
    },


    /**
     * 初始化
     *
     */
    initMgr(){
        cc.pgy = {};

        let SdkMgr = require("SdkMgr");
        cc.pgy.sdkMgr = new SdkMgr();

        cc.pgy.cmdSDK = require("cmblifeSDK");

        // 工具包
        let Util = require("Utils");
        cc.pgy.util = new Util();

        // Http请求
        let Http = require("Http");
        cc.pgy.request = new Http();

        // 配置信息
        cc.pgy.cfg = {};
        cc.pgy.cfg.isFirst = true; // 第一次（决定是否显示新手引导）
        cc.pgy.cfg.audio = false; // 是否需要声音
        cc.pgy.cfg.actCount = 6;   // 使用几幕
        cc.pgy.cfg.type = "dd"; // cmb-招行

        // 用户数据
        cc.pgy.data = {};
        cc.pgy.data.nickName = ""; // 昵称
        cc.pgy.data.lastCount = 5;// 剩余次数
        cc.pgy.data.lessenCount = 1; // 每次游戏扣除积分
    },


    /**
     * 开始加载资源
     *
     */
    startPreload(){
        this._isLoading = true;

        this.spriteCat.node.x = this.progressBar.node.x - (this.progressBar.node.width >> 1);

        let self = this;
        cc.loader.loadResDir("texture",
            // 加载进度
            function ( completedCount, totalCount,  item ){
                if(self._isLoading){
                    self._progress = completedCount * 1.0 /totalCount;
                }
            },

            // 加载完成
            function (err, assets) {                
                self.onLoadComplete();
            }
        );
    },


    /**
     * 加载完成
     *
     */
    onLoadComplete(){
        this._isLoading = false;
        
        // 招行
        if(cc.pgy.cfg.type == "cmb"){
            let self = this;
            cc.pgy.util.addLoading("初始化...", function(){
                cc.pgy.sdkMgr.initSdk(function(obj){
                    self.sdkInitCallback(obj);
                });
            });
        }
        else{
            cc.director.loadScene("home");
        } 
    },


    /**
     * sdk初始化回调
     *
     * @param {*} obj
     */
    sdkInitCallback(obj){
        cc.pgy.util.removeLoading();

        let self = this;
        if(obj.ret == "success"){
            self.repairOrderLogic();
        }
        else if(obj.ret == "name_null"){
            cc.pgy.util.addNameInput(function(json){
                self.modifyCallback();
            })
        }
        else{
            cc.pgy.util.addMsgBox(obj.msg);
        }
    },

    
    /**
     * 昵称设置成功回调
     *
     * @param {*} obj
     */
    modifyCallback(obj){
        let self = this;
        this.repairOrderLogic();       
    },


    /**
     * 补单逻辑
     *
     * @returns
     */
    repairOrderLogic(){
        let orderInfo = cc.sys.localStorage.getItem("orderInfo");

        // 不需要补单
        if(orderInfo == null){
            cc.director.loadScene("home");
            return;
        }

        // 查找需要补单的（可能存在多个用户的）
        let index = -1;
        let datas = JSON.parse(orderInfo);
        let data = null;
        for(let i = 0; i < datas.length; i++){
            if(datas[i].tokenId == cc.pgy.zh_open.tokenId){
                data = datas[i];
                index = i;
                break;
            }
        }

        // 有遗漏订单，申请补单
        if(data != null){
            cc.pgy.util.addLoading("", function(){
                cc.pgy.sdkMgr.repairOrder({
                    info: data,
                    callback: function(json){
                        cc.pgy.util.removeLoading();
                        if(json != null && json.result != null && json.result){
                            // 补单成功，删除数据
                            datas.splice(index, 1);
                            cc.sys.localStorage.setItem("orderInfo", JSON.stringify(datas));
                            caches.director.loadScene("home");
                        }
                        else{
                            cc.pgy.util.addMsgBox("补单失败");
                        }
                    }
                });
            });
        }
    },
});
