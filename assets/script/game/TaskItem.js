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
        labelDesc: {
            default: null,
            type: cc.Label,
            tooltip: "描述"
        },

        labelProgress: {
            default: null,
            type: cc.Label,
            tooltip: "进度"
        },

        labelReward: {
            default: null,
            type: cc.Label,
            tooltip: "奖励"
        },

        labelTime: {
            default: null,
            type: cc.Label,
            tooltip: "时间"
        },

        spriteState: {
            default: null,
            type: cc.Sprite,
            tooltip: "状态"
        },
        spriteFrameState: [cc.SpriteFrame], // 0-可领取 1-未达成 2-已领取

        buttonState: {
            default: null,
            type: cc.Button,
            tooltip: "状态"
        },

        _data: null,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    reload(data){
        this._data = data;
        this.labelDesc.string = data.jobName;
        this.labelProgress.string = 0 + "/" + data.figureNum;
        this.labelReward.string = data.award + "积分";
        this.labelTime.string = cc.pgy.util.timestampToTime(data.jobEndTime);
        this.spriteState.spriteFrame = this.spriteFrameState[0];
        this.spriteState.node.y = (false)? 2: 0;
        this.buttonState.interactable = (true);
    },

    
    /**
     * 点击获取任务奖励
     *
     * @param {*} event
     * @param {*} customEventData
     */
    onGetTaskRewardClick(event, customEventData){
        if(cc.pgy.cfg.type == "cmb"){
            let self = this;
            cc.pgy.util.addLoading("", function(){
                cc.pgy.sdkMgr.getTaskReward({
                    taskId: self._data.id,
                    callback: function(json){
                        cc.pgy.util.removeLoading();
                        self.onGetTaskRewardResp(json);
                    }
                });
            });
        }
    },


    /**
     * 领取回调
     *
     * @param {object} json
     */
    onGetTaskRewardResp(json){
        if(json.result){
            this.reload(this._data);
        }
        else{
            cc.pgy.util.addMsgBox(json.error.message);
        }
    },

    // update (dt) {},
});
