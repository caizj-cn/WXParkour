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
        prefabMsgBox: cc.Prefab,
        prefabLoading: cc.Prefab,
        prefabResult: cc.Prefab,
        prefabConsumeBox: cc.Prefab,
        prefabGameOverBox: cc.Prefab,
        
        spriteCat: {
            default: null,
            type: cc.Sprite,
            tooltip: "猫"
        },

        spriteTimer: {
            default: null,
            type: cc.Sprite,
            tooltip: "倒计时"
        },

        labelCoinCount: {
            default: null,
            type: cc.Label,
            tooltip: "金币数"
        },

        labelDistance: {
            default: null,
            type: cc.Label,
            tooltip: "距离"
        },

        _gameState: {
            default: 0, //0-游戏中
            visible: false,
            tooltip: "游戏状态"
        },

        score: {
            default: 0,
            tooltip: "得分",
        },

        distance: {
            default: 0,
            tooltip: "已经跑的距离（米）"
        },

        maxDistance: {
            default: 100,
            tooltip: "最大距离（米）"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.showLoading("正在初始化...");
        this.init();

        // 设置猫事件的回调
        let self = this;
        let jsCat = this.spriteCat.getComponent("Cat");
        if(jsCat != null){
            jsCat.onBingo = function(){
                self.onCatBingo();
            }
            jsCat.onDead = function(){
                self.onCatDead();
            }
            jsCat.onStop = function(){
                self.onCatStop();
            }
        }

        // 注册屏幕触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            self.onTouchStart(event);
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function(event){
            self.onTouchEnd(event);
        }, this);
        
        // 扣分提示
        this.showConsumeBox();
    },


    /**
     *  触摸开始
     *
     * @param {*} event
     */
    onTouchStart(event){
    },


    /**
     * 触摸结束
     *
     * @param {*} event
     */
    onTouchEnd(event){
        let jsCat = this.spriteCat.getComponent("Cat");
        if(jsCat.state === "stay" || jsCat.state === "die"){
            return;
        }

        let startY = event.getStartLocation().y;
        let endY = event.getLocation().y;

        let offset = endY - startY;

        if(offset > 10){
            this.catJump();
        }
        else if(offset < -10){
            this.catDown();
        }
        else{

        }
        
    },

    catRun(){
        let jsCat = this.spriteCat.getComponent("Cat");
        if(jsCat != null){
            jsCat.run();
        }
    },

    catJump(){
        let jsCat = this.spriteCat.getComponent("Cat");
        if(jsCat != null){
            jsCat.jump();
        }
    },

    catDown(){
        let jsCat = this.spriteCat.getComponent("Cat");
        if(jsCat != null){
            jsCat.down();
        }
    },


    /**
     * 猫吃到金币回调
     *
     */
    onCatBingo(){
        this.score++;
        this.labelCoinCount.string = this.score;
    },


    /**
     *  猫撞到账户无回调
     *
     */
    onCatDead(){
        this.endGame();
    },


    /**
     * 猫停下
     *
     */
    onCatStop(){
        // 显示距离
        this.distance = this.maxDistance;
        this.labelDistance.string = this.distance;
        this.endGame();
    },

    /**
     * 初始化
     *
     */
    init(){
        this.score = 0;

        this._contextMgr = this.getComponent("ContextMgr");
        this._levelMgr = this.getComponent("LevelMgr");
        cc.pgy.util.playMusic();
    },


    /**
     * 开始游戏
     *
     */
    startGame(){
        // 设置动画播完回调        
        let self = this;
        let jsTimer = this.spriteTimer.getComponent("Timer");
        jsTimer.onTimeEndCallback = function (){
            self.onTimeEnd();
        }

        // 播放动画
        let anim = this.spriteTimer.getComponent(cc.Animation);
        anim.play();
        cc.pgy.util.playEffect("countdown");
    },


    /**
     * 游戏结束回调
     *
     */
    onTimeEnd(){
        // 场景开始移动
        this._contextMgr.startMove();
        // 猫开始跑
        this.catRun();
    },


    /**
     * 结束游戏
     *
     */
    endGame(){
        this._contextMgr.stopMove();

        if(cc.pgy.cfg.type == "cmb"){
            let self = this;
            cc.pgy.util.addLoading("", function(){
                // 申请加积分
                cc.pgy.sdkMgr.earning({
                    range:self.distance,
                    goldCoinCount:self.score,
                    callback: function(json){
                        cc.pgy.util.removeLoading();
                        if(json != null && json.result != null && json.result){
                            self.showGameOverBox(self.score, self.distance);
                        }
                        else{
                            let msg = "增加积分失败！";
                            if(json.error != null && json.error.message != null && json.error.message != ""){
                                msg = json.error.message;
                            }
                            cc.pgy.util.addMsgBox(msg);
                        
                            // 记录补单数据
                            let data = {};
                            let datas = cc.sys.localStorage.getItem("orderInfo");
                            if(datas != null){
                                datas = JSON.parse(datas);
                                datas.push(data);
                            }
                            else{
                                datas = data;
                            }
                            cc.sys.localStorage.setItem("orderInfo", JSON.stringify(datas));
                        }
                    }
                });
            });
        }
        else{
            this.showGameOverBox(this.score, this.distance);
        }        
    },

    onBgMoveEnd(){
        cc.log("end");
        this.spriteCat.node.runAction(cc.moveTo(0.2, 0, this.spriteCat.node.y));
    },

    /**
     * 游戏初始化回调
     *
     * @param {object} obj - {code: number, msg: string}
     */
    sdkInitCallback(obj){
        let code = obj.code;
        let msg = obj.msg;

        if(code == 0 || code == 1){
            this.hideLoading();
        }
        else{
            this.hideLoading();
            this.showMsgBox(msg);
        }
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
     * 显示游戏结束
     *
     * @param {number} coin 金币
     * @param {number} distance 距离
     * @returns
     */
    showGameOverBox(coin, distance){
        if(this.prefabGameOverBox == null){
            return;
        }

        let self = this;
        let gameOver = this.node.getChildByName("pgy_GameOverBox");
        if(gameOver == null){
            gameOver = cc.instantiate(this.prefabGameOverBox);
            this.node.addChild(gameOver, 10, "pgy_GameOverBox");
            gameOver.x = 0;
            gameOver.y = 0;
            
            let jsGameOverBox = gameOver.getComponent("GameOverBox");
            if(jsGameOverBox != null){
                jsGameOverBox.setCoin(coin);
                jsGameOverBox.setDistance(distance);
            }
        }
    },


    /**
     * 隐藏游戏结束
     *
     */
    hideGameOverBox(){
        this.removeChildByName("pgy_GameOverBox");
    },


    /**
     * 显示扣除积分提示
     *
     * @returns
     */
    showConsumeBox(){
        let self = this;
        let consume = this.node.getChildByName("pgy_ConsumeBox");
        if(consume == null){
            consume = cc.instantiate(this.prefabConsumeBox);
            this.node.addChild(consume, 10, "pgy_ConsumeBox");
            consume.x = 0;
            consume.y = 0;
            consume.getComponent("ConsumeBox").startCallback =  function(){
                self.startGame();
            };
        }
    },


    /**
     * 隐藏扣除积分提示
     *
     */
    hideConsumeBox(){
        this.removeChildByName("pgy_ConsumeBox");
    },

    /**
     * 显示Loading
     *
     * @param {string} msg - loading提示文字
     * @returns
     */
    showLoading(msg){
        if(this.prefabLoading == null){
            return;
        }

        let loading = this.node.getChildByName("pgy_Loading");
        if(loading == null){
            loading = cc.instantiate(this.prefabLoading);
            this.node.addChild(loading, 10, "pgy_Loading");
            loading.x = 0;
            loading.y = 0;
        }

        if(msg != null && typeof(msg) == "string"){
            let js = loading.getComponent("Loading");
            if(js != null){
                js.setText(msg);
            }
        }
    },

    /**
     * 隐藏Loading
     *
     */
    hideLoading(){
        this.removeChildByName("pgy_Loading");
    },

    /**
     * 显示弹窗
     *
     * @param {string} msg - 内容
     * @param {string} title - 标题
     * @returns
     */
    showMsgBox(msg, title){
        if(this.prefabMsgBox == null){
            return;
        }

        if(title == null){
            title = "提示";
        }

        if(msg == null || typeof(msg) != "string"){
            return;
        }

        let msgBox = this.node.getChildByName("pgy_MsgBox");
        if(msgBox == null){
            msgBox = cc.instantiate(this.prefabMsgBox);
            this.node.addChild(msgBox, 10, "pgy_MsgBox");
            msgBox.x = 0;
            msgBox.y = 0;
        }

        let js = msgBox.getComponent("MsgBox");
        if(js != null){
            js.setTitle(title);
            js.setMsg(msg);
        }
    },

    /**
     * 隐藏弹窗
     *
     */
    hideMsgBox(){
        this.removeChildByName("pgy_MsgBox");
    },

    /**
     * 显示结算
     *
     * @param {number} score - 得分
     * @param {number} jifen - 积分
     */
    showResult(score, jifen){
        let result = this.node.getChildByName("pgy_Result");
        if(result == null){
            result = cc.instantiate(this.prefabResult);
            this.node.addChild(result, 10, "pgy_Result");
            result.x = 0;
            result.y = 0;
        }

        if(score != null && typeof(score) == "number"){
            let js = result.getComponent("Result");
            if(js != null){
                js.setScore(score);
                js.setJifen(jifen);
            }
        }
    },

    /**
     * 隐藏结算
     *
     */
    hideResult(){
        this.removeChildByName("pgy_Result");
    },

    /**
     * 修改分数
     *
     * @param {*} score
     * @returns
     */
    setScore(score){
        if(this.txtScore == null){
            return;
        }

        if(score != null && typeof(score) == "number"){
            this.score = score;
            this.txtScore.string = score;
        }
    },

    /**
     * 获取分数
     *
     * @returns
     */
    getScore(){
        return this.score;
    },

    update (dt) {
        let jsCat = this.spriteCat.getComponent("Cat");
        if(jsCat.state == "run"){
            // 当前像素距离
            let length = (this._levelMgr.actIndex - 1) * this._levelMgr.maxActWidth - this._contextMgr.nodeBgBottom.x - cc.winSize.width / 2;
            
            // 最大像素距离
            let maxLength = 0;
            if(cc.pgy.cfg.actCount == 1){
                maxLength = this._levelMgr.maxActWidth - this.spriteCat.node.x;
            }
            else{
                maxLength = this._levelMgr.maxActWidth * cc.pgy.cfg.actCount - this.spriteCat.node.x;// - cc.winSize.width;
            }

            // 显示距离
            this.distance = Math.floor((length / maxLength) * this.maxDistance);
            this.labelDistance.string = this.distance;
        }
    },
});