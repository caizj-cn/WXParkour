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
        nodeStep1: {
            default: null,
            type: cc.Node
        },

        nodeStep2: {
            default: null,
            type: cc.Node
        },

        spriteLeftHand: {
            default: null,
            type: cc.Sprite
        },

        spriteRightHand: {
            default: null,
            type: cc.Sprite
        },

        // 点击开始回调
        startCallback: {
            default: null,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // 屏蔽触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            event.stopPropagation();
        });

        this.nodeStep1.active = true;
        this.nodeStep2.active = false;

        this.playGuide();
    },

    playGuide(){
        let pos_l = this.spriteLeftHand.node.position;
        this.spriteLeftHand.node.runAction(cc.sequence(
            cc.moveBy(0.8, 0, 200),
            cc.delayTime(0.8),
            cc.place(pos_l)
        ).repeatForever());

        let pos_r = this.spriteRightHand.node.position;
        this.spriteRightHand.node.runAction(cc.sequence(
            cc.moveBy(0.8, 0, -200),
            cc.delayTime(0.8),
            cc.place(pos_r)
        ).repeatForever());
    },

    onNextClick(event, customEventData){
        this.nodeStep1.active = false;
        this.nodeStep2.active = true;
    },

    onStartGameClick(event, customEventData){
        this.node.removeFromParent();
        if(this.startCallback != null){
            this.startCallback();
        }
    },

    // update (dt) {},
});
