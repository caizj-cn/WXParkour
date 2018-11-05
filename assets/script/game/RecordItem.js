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
        labelTime: {
            default: null,
            type: cc.Label,
            tooltip: "进度"
        },

        labelEarn: {
            default: null,
            type: cc.Label,
            tooltip: "进度"
        },

        labelConsume: {
            default: null,
            type: cc.Label,
            tooltip: "进度"
        },

        labelState: {
            default: null,
            type: cc.Label,
            tooltip: "进度"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    reload(data){
        this.labelState.string = data.state;
        this.labelConsume.string = data.consume;
        this.labelEarn.string = data.earn;
        this.labelTime.string = cc.pgy.util.timestampToTime(data.time);
    },
});
