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
        btnRestart: cc.Button,
        txtScore: cc.Label,
        txtJifen: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 屏蔽触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            event.stopPropagation();
        });

        if(this.btnRestart != null){
            let self = this;
            this.btnRestart.node.on("click", function(event){
                self.node.removeFromParent();
                cc.director.loadScene("game");
            });
        }
    },

    /**
     * 设置分数
     *
     * @param {number} score -分数
     */
    setScore(score){
        // score = 9999999;
        if(this.txtScore != null){
            if(score == null || typeof(score) != "number"){
                score = 0;
            }

            this.txtScore.string = score;
        }
    },


    /**
     * 设置积分
     *
     * @param {number} jifen
     */
    setJifen(jifen){
        if(this.txtJifen != null){
            if(jifen == null || typeof(jifen) != "number"){
                jifen = 0;
            }

            this.txtJifen.string = jifen;
        }
    },

    start () {

    },

    // update (dt) {},
});
