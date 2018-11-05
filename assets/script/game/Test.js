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
        btnTest:cc.Button,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // this.btnTest.node.on("click", function(event){
        //     let jsContextMgr = this.getComponent("ContextMgr");
        //     if(jsContextMgr != null){
        //         jsContextMgr.startMove();
        //     }
        // },this);

        let jsContextMgr = this.getComponent("ContextMgr");
        if(jsContextMgr != null){
            jsContextMgr.startMove();
        }
    },

    // update (dt) {},
});
