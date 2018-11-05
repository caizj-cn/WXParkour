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
        txtTimes: {
            default: null,
            type: cc.Label,
            tooltip: "剩余次数"
        },

        spriteHint: {
            default: null,
            type: cc.Sprite,
            tooltip: "开始提示"
        },

        spriteCat: {
            default: null,
            type: cc.Sprite,
            tooltip: "猫"
        },

        // 声音控制图片
        spriteAudio:{
            default: null,
            type: cc.Sprite
        },

        // 声音按钮纹理（有和无两种）
        spriteFrameAudio: [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.playHintAnimation();
        this.initAudio();
        this.setTimes(cc.pgy.data.lastCount);
    },

    initAudio(){
        if(cc.pgy.cfg.audio){
            this.spriteAudio.spriteFrame = this.spriteFrameAudio[0];
            cc.pgy.util.playMusic();
        }
        else{
            this.spriteAudio.spriteFrame = this.spriteFrameAudio[1];
            cc.pgy.util.stopMusic();
        }
    },

    /**
     * 设置剩余次数
     *
     * @param {number} times
     */
    setTimes(times){
        if(times == null || (typeof times != "number")){
            return;
        }

        this.txtTimes.string = times;
    },


    /**
     * 播放提示动画
     *
     */
    playHintAnimation(){
        this.spriteHint.node.runAction(cc.sequence(
            cc.fadeOut(0.8),
            cc.fadeIn(0.8)
        )).repeatForever();
    },

    /**
     * 根据名称移除节点
     *
     * @param {*} name
     */
    removeChildByName(name){
        if(typeof name != "string"){
            return false;
        }

        let child = this.node.getChildByName(name);
        if(child != null){
            child.removeFromParent();
        }
    },

    /**
     * 开始游戏
     *
     * @param {*} event
     * @param {*} customEventData
     */
    onStartClick(event, customEventData){
        if(cc.pgy.data.lastCount > 0){
            cc.pgy.util.stopMusic();
            cc.director.loadScene("game");
        }
        else{
            cc.pgy.util.addMsgBox("今日次数已经用完！");
        }
    },


    /**
     * 音效
     *
     * @param {*} event
     * @param {*} customEventData
     */
    onMusicClick(event, customEventData){
        let node = event.target;
        let sprite = node.getComponent(cc.Sprite);
        let audio = this.getComponent("AudioMgr");
        if(sprite.spriteFrame == this.spriteFrameAudio[0]){
            sprite.spriteFrame = this.spriteFrameAudio[1];
            cc.pgy.cfg.audio = false;
            cc.pgy.util.stopMusic();
        }
        else if(sprite.spriteFrame == this.spriteFrameAudio[1]){
            sprite.spriteFrame = this.spriteFrameAudio[0];
            cc.pgy.cfg.audio = true;
            cc.pgy.util.playMusic();
        }
        else{
            cc.log("2");
        }
    },


    /**
     * 规则
     *
     * @param {*} event
     * @param {*} customEventData
     */
    onRuleClick(event, customEventData){
        cc.pgy.util.addChildByPrefabName("pgy_ruleBox", "RuleBox", 10);
    },


    /**
     * 记录
     *
     * @param {*} event
     * @param {*} customEventData
     */
    onRecordClick(event, customEventData){
        cc.pgy.util.addChildByPrefabName("pgy_recordBox", "RecordBox", 10);
    },


    /**
     * 任务
     *
     * @param {*} event
     * @param {*} customEventData
     */
    onTaskClick(event, customEventData){
        cc.pgy.util.addChildByPrefabName("pgy_taskBox", "TaskBox", 10);
    },
    // update (dt) {},
});
