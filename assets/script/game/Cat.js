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
        jumpHeight:{
            default: 60,
            tooltip: "跳的高度"
        },

        downHeight:{
            default: -60,
            tooltip: "蹲下高度"
        },

        state: {
            default: "stay",
            tooltip: "猫是否在运动"
        },

        jumpClip: {
            default: null,
            type: cc.AnimationClip
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        let mgr = cc.director.getCollisionManager();
        mgr.enabled = true;

        // mgr.enabledDebugDraw = true;
        // mgr.enabledDrawBoundingBox = true;
    },

    /**
     * 当碰撞产生的时候调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionEnter: function (other, self) {
        if(self.node.group != "cat"){
            return;
        }

        // 获取到金币
        if(other.node.group == "coin"){
            other.node.runAction(cc.removeSelf());
            cc.pgy.util.playEffect("hit_coin");
            if(this.onBingo != undefined){
                this.onBingo();
            }
        }

        // 撞到砖块
        else if(other.node.group == "box"){
            this.die();
            if(this.onDead != undefined){
                this.onDead();
            }
        }
        // 到达旗子
        else if(other.node.group == "flag"){
            this.stop();
            if(this.onStop != undefined){
                this.onStop();
            }
        }
        else{
            cc.log(other.node.group);
        }
    },

    /**
     * 当碰撞产生后，碰撞结束前的情况下，每次计算碰撞结果后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionStay: function (other, self) {
        // console.log('on collision stay');
    },

    /**
     * 当碰撞结束后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionExit: function (other, self) {
        // console.log('on collision exit');
    },


    /**
     * 跑
     *
     */
    run(){
        this.getComponent(cc.Animation).play("run");
        this.state = "run";
    },


    /**
     * 跳
     *
     */
    jump(){
        if(this.state != "run"){
            return;
        }

        this.state = "jump"
        this.node.runAction(cc.jumpBy(this.jumpClip.duration / this.jumpClip.speed, cc.v2(0, 0), this.jumpHeight, 1));
        this.getComponent(cc.Animation).playAdditive("jump");
    },

    
    /**
     * 蹲
     *
     */
    down(){
        if(this.state != "run"){
            return;
        }

        this.state = "down";
        this.getComponent(cc.Animation).playAdditive("down");
    },


    /**
     * 死
     *
     */
    die(){
        this.state = "die";
        this.getComponent(cc.Animation).play("hit");
        this.node.stopAllActions();
    },

    stop(){
        this.state = "stay";
        this.getComponent(cc.Animation).stop();
        this.node.stopAllActions();
    },

    onJumpFinished(){
        this.state = "run";
    },

    onDownFinished(){
        this.state = "run";
    },

    onHitFinished(){
    },

    // update (dt) {},
});
