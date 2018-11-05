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
        nodeBgTop: {
            default: null,
            type: cc.Node,
            tooltip: "背景上层"
        },

        nodeBgBottom: {
            default: null,
            type: cc.Node,
            tooltip: "背景下层"
        },

        spriteFlag: {
            default: null,
            type: cc.Sprite,
            tooltip: "旗子"
        },

        bgOffset: {
            default: 3858,
            tooltip: "背景总宽度"
        },

        moveSpeed: {
            default: 5,
            tooltip: "移动速率(越小越快)"
        },

        p2mRatio: {
            default: 10,
            tooltip: "1米多少像素",
        },

        maxActCount: {
            default: 3,
            tooltip: "最大场景个数"
        },

        actIndex: {
            default: 1,
            tooltip: "当前场景索引"
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 调整背景图位置
        this.nodeBgTop.x = -cc.winSize.width / 2;
        this.nodeBgTop.y = cc.winSize.height / 2;
        this.nodeBgBottom.x = -cc.winSize.width / 2;
        this.nodeBgBottom.y = -cc.winSize.height / 2;

        let jsLevelMgr = this.getComponent("LevelMgr");
        if(jsLevelMgr != null){
            jsLevelMgr.p2mRatio = this.p2mRatio;
            jsLevelMgr.initMgr();
            jsLevelMgr.reload();
        }

        this._levelMgr = jsLevelMgr;
    },

    /**
     * 移动背景层
     *
     */
    moveBackground(){
        let self = this;
        // 顶部
        let top_move = cc.moveBy(this.moveSpeed, -this.bgOffset + cc.winSize.width, 0);
        let top_act = cc.sequence(
            top_move,
            cc.callFunc(function(){
                if(self._levelMgr.actIndex >= cc.pgy.cfg.actCount){
                    self.nodeBgTop.stopActionByTag(0xff);
                }
                else{
                    self.nodeBgTop.position = cc.v2(-cc.winSize.width / 2, cc.winSize.height / 2);
                }
            })
        ).repeat(cc.pgy.cfg.actCount);
        top_act.setTag(0xff);
        this.nodeBgTop.runAction(top_act);

        // 下部
        let bott_move = cc.moveBy(this.moveSpeed, -this.bgOffset + cc.winSize.width, 0);
        let bott_act = cc.sequence(
            cc.callFunc(function(){
                if(self._levelMgr.actIndex >= cc.pgy.cfg.actCount){
                    self.spriteFlag.node.active = true;
                }
            }),
            bott_move,
            cc.callFunc(function(){
                if(self._levelMgr.actIndex >= cc.pgy.cfg.actCount){
                    self.nodeBgBottom.stopActionByTag(0xff);
                    self.onMoveEnd();
                }
                else{
                    self.nodeBgBottom.position = cc.v2(-cc.winSize.width / 2, -cc.winSize.height / 2);
                    self._levelMgr.actIndex++;
                    self._levelMgr.reload();
                }
            })
        ).repeat(cc.pgy.cfg.actCount);
        bott_act.setTag(0xff);
        this.nodeBgBottom.runAction(bott_act);
    },


    /**
     * 停止背景移动
     *
     */
    stopBackground(){
        this.nodeBgTop.stopActionByTag(0xff);
        this.nodeBgBottom.stopActionByTag(0xff);
    },

    start () {
    },


    /**
     *
     *
     */
    startMove(){
        this.moveBackground();
    },

    stopMove(){
        this.nodeBgTop.stopActionByTag(0xff);
        this.nodeBgBottom.stopActionByTag(0xff);
    },

    onMoveEnd(){
        this.getComponent("Game").onBgMoveEnd();
    },

    // update (dt) {},
});
