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

        _progress: {
            default: 0,
            visible: false,
            tooltip: "进度"
        },

        _isLoading: {
            default: false,
            tooltip: "是否正在加载"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.initMgr();

        this.startPreload();
    },

    initMgr(){
        cc.pgy = {};

        let AudioMgr = require("AudioMgr");
        cc.pgy.audioMgr = new AudioMgr();

        let SdkMgr = require("SdkMgr");
        cc.pgy.sdkMgr = new SdkMgr();

        cc.pgy.cmdSDK = require("cmblifeSDK");

        // 工具包
        let Util = require("Utils");
        cc.pgy.util = new Util();

        // Http请求
        let Http = require("Http");
        cc.pgy.request = new Http();
    },

    startPreload(){
        this._isLoading = true;

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

    onLoadComplete(){
        this._isLoading = false;
        cc.director.loadScene("home");
    },

    update (dt) {
        // 更新资源加载进度
        if(this._isLoading){
            this.labelProgress.string = Math.floor(this._progress * 100);
            this.progressBar.progress = this._progress;
        }
    },
});
