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
        labelRules: {
            default: null,
            type: cc.Label,
            tooltip: "游戏规则"
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // 屏蔽触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            event.stopPropagation();
        });

        if(cc.pgy.cfg.type == "cmb"){
            let self = this;
            cc.pgy.util.addLoading("", function(){
                cc.pgy.sdkMgr.getAllRules({
                    callback: function(json){
                        cc.pgy.util.removeLoading();
                        self.onGetAllRulesResp(json);
                    }
                });
            });
        }
    },

    // update (dt) {},

    onCloseClick(event, customEventData){
        this.node.removeFromParent();
    },

    /**
     * 请求记录返回
     *
     * @param {object} json
     */
    onGetAllRulesResp(json){
        if(json.result){
            let str = "";
            for(let i = 0; i < json.data.rules.length; i++){
                str = str + (i + 1) + "." + json.data.rules[i].text;
                if(i != json.data.rules.length -1){
                    str = str + "；\n";
                }
                else{
                    str = str + "。";
                }
            }
            this.labelRules.string = str;
        }
        else{
            cc.pgy.util.addMsgBox(json.error.message);
        }
    },
});
