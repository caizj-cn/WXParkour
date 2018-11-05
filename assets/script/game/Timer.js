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
        onTimeEndCallback: {
            default: null,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    onTimeEnd(){
        this.node.removeFromParent();
        if(this.onTimeEndCallback != null){
            this.onTimeEndCallback();
        }
    },

    onStartScale(){
        this.node.runAction(cc.sequence(
            cc.scaleTo(0, 0, 0),
            cc.scaleTo(0.8, 1, 1),
            cc.delayTime(0.2),
            cc.scaleTo(0, 0, 0)
        ));
    },
});
