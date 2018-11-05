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
        spriteLoading: cc.Sprite,
        labelMsg: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            event.stopPropagation();
        });
    },

    start () {
        this.spriteLoading.node.runAction(cc.rotateBy(0.6, -360)).repeatForever();
    },


    /**
     * 设置loading提示内容
     *
     * @param {string} msg - 提示内容
     * @returns
     */
    setText(msg){
        if(this.labelMsg == null){
            return;
        }

        if(msg == null || typeof(msg) != "string"){
            return;
        }

        this.labelMsg.string = msg;
    },

    // update (dt) {},
});
