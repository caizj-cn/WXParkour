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
        txtMsg: cc.Label,
        btnSure: cc.Button,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 屏蔽触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            event.stopPropagation();
        });

        if(this.btnSure != null){
            this.btnSure.node.on("click", this.onSureClick, this);
        }
    },


    /**
     * 确定按钮
     *
     * @param {object} event
     */
    onSureClick(event){
        if(cc.pgy.cmdSDK != null){
            cc.pgy.cmdSDK.close();
        }
    },
    
    start () {
        if(this.txtMsg != null){
            this.txtMsg = "";
        }
    },
    
    /**
     * 设置内容
     *
     * @param {string} msg
     * @returns
     */
    setMsg(msg){
        if(this.txtMsg == null){
            return;
        }

        if(msg == null || typeof(msg) != "string"){
            return;
        }

        this.txtMsg.string = msg;
    },

    // update (dt) {},
});
