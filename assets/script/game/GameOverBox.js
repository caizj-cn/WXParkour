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
        txtCoin: {
            default: null,
            type: cc.Label,
            tooltip: "金币"
        },

        txtDistance: {
            default: null,
            type: cc.Label,
            tooltip: "距离"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    /**
     * 点击返回首页
     *
     * @param {*} event
     * @param {*} customEventData
     */
    onBackHomeClick(event, customEventData){
        cc.director.loadScene("home");
    },


    /**
     * 点击重新开始
     *
     * @param {*} event
     * @param {*} customEventData
     */
    onRestartGameClick(event, customEventData){
        cc.director.loadScene("game");
    },


    /**
     * 设置金币
     *
     * @param {number} coin
     * @returns
     */
    setCoin(coin){
        if(this.txtCoin == null){
            return;
        }

        if(typeof coin != "number"){
            return;
        }

        this.txtCoin.string = coin;
    },


    /**
     * 设置距离
     *
     * @param {number} distance 距离
     * @returns
     */
    setDistance(distance){
        if(this.txtDistance == null){
            return;
        }

        if(typeof distance != "number"){
            return;
        }

        this.txtDistance.string = distance;
    },
});
