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
        // 点击开始回调
        startCallback: {
            default: null,
            visible: false
        },

        labelCount: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // 屏蔽触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            event.stopPropagation();
        });

        this.labelCount.string = cc.pgy.data.lessenCount;
    },

    onBackHomeClick(event, customEventData){
        cc.director.loadScene("home");
    },

    onStartGameClick(event, customEventData){
        if(cc.pgy.data.lastCount <= 0){
            cc.pgy.util.addMsgBox("今日次数已经用完！");
            return;
        }

        if(cc.pgy.cfg.type == "cmb"){
            let self = this;
            cc.pgy.util.addLoading("", function(){
                cc.pgy.sdkMgr.consume({
                    callback: function(json){
                        cc.pgy.util.removeLoading();
                        if(json != null && json.result != null && json.result){
                            cc.pgy.data.lastCount--;
                            self.onConsumeCallback();
                        }
                        else{
                            let msg = "扣除积分失败！";
                            if(json.error != null && json.error.message != null && json.error.message != ""){
                                msg = json.error.message;
                            }
                            cc.pgy.util.addMsgBox(msg);
                        }
                    }
                });
            });

            this.node.removeFromParent();
        }
        else{
            cc.pgy.data.lastCount--;
            this.onConsumeCallback();
        }
    },
    
    /**
     * 扣除积分回调
     *
     */
    onConsumeCallback(){
        // 第一次打开
        if(cc.pgy.cfg.isFirst){
            cc.pgy.cfg.isFirst = false;
            let self = this;
            cc.loader.loadRes("prefab/GuideBox", function (err, prefab) {
                let newNode = cc.instantiate(prefab);
                cc.director.getScene().addChild(newNode, 10, "GuideBox");
                let jsGuideBox = newNode.getComponent("GuideBox");
                jsGuideBox.startCallback = self.startCallback;
                cc.sys.localStorage.setItem("play_count", 1);
                self.node.removeFromParent();
            });
        }

        // 非第一次打开
        else{
            this.node.removeFromParent();
            if(this.startCallback != null){
                this.startCallback();
            }
        }
    },

    // update (dt) {},
});
