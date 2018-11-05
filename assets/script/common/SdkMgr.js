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
        // 测试服
        host:"http://10.0.8.70:8082",
        
        // // 正式服
        // host: "https://miaomiao.cmb.wanzhuanxiong.com",

        // 是否成功初始化
        init: false,

        // 每次进入游戏消耗的积分
        price: {
            default:9,
            visible: false,
        },

        // 开始时间戳
        startTimeStamp: 0,

        // 秘钥
        // secretKey:"abcd1234",
        secretKey: "afdbe67f259445299af57159dda4ae31"
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    start () {
    },

    /**
     * 初始化：1.检验招行入口参数；2.平台初始化；3.扣除积分
     * @param {function()} callback -{ret:string, msg:string}
     *  code说明：
     *    success        联网初始化成功（包括扣除积分） 
     *    cmb_error      联网招行入口参数校验失败
     *    open_error     联网初始化接口失败
     *    consume_faile  联网扣积分失败
     *    name_null      昵称为空
     * 
     * @returns
     */
    initSdk(callback){
        this._initCallback = callback;

        this.initUtils();

        let query = cc.pgy.util.getQuery();

        let ret = this.initCMB(query);
        if(ret == 0){
            this.initOpen();
        }
        else if(ret == 1){
            this.init = false;
            callback({ret: "cmb_error", msg: "招行入口参数为空"});
        }
        else if(ret == 2){
            this.init = false;
            callback({ret: "cmb_error", msg: "招行入口参数错误"});
        }
        else{

        }
    },

    /**
     * 初始化工具
     *
     */
    initUtils(){
        this.log("init sdk start!!!");

        if(cc.pgy == null || cc.pgy == undefined){
            cc.pgy = {};
        }

        // 招行数据
        cc.pgy.zh_open = {};
        this.init = false;

        this.log("init sdk done!!!");
    },

    /**
     * 获取招行入口参数
     *
     * @param {string} query
     * @returns {number} 0-成功 1-参数为空 2-招行入口参数出错
     */
    initCMB(query){
        this.log("initCMB sdk start!!!");
        this.log(query);
        
        if(query == null || query == ""){
            return 1;
        }

        // if(!this.verifyCMB(query)){
        //     this.log(query);
        //     return 2;
        // }

        // cc.pgy.zh_open = cc.pgy.util.queryToObject(query);

        // test
        cc.pgy.zh_open.channelId = 1;
        cc.pgy.zh_open.tokenId = "bfb88145efa964bc0015b4d45955f133";
        cc.pgy.zh_open.gameId = "2";

        this.log("initCMB sdk done!!!");

        return 0;
    },

    /**
     * 招行入口参数验证
     *
     * @param {string} query - 入口参数
     * @returns
     */
    verifyCMB(query){
        this.log("verifyCMB start!!!");
        let obj = cc.pgy.util.queryToObject(query);

        if(obj.result == null || obj.result == ""){
            return false;
        }

        if(obj.result === "false"){
            if(obj.code == null || obj.code == ""){
                return false;
            }
    
            if(obj.msg == null || obj.msg == ""){
                return false;
            }
        }

        if(obj.gameId == null || obj.gameId == ""){
            return false;
        }

        if(obj.tokenId == null || obj.tokenId == ""){
            return false;
        }

        if(obj.time == null || obj.time == ""){
            return false;
        }

        if(obj.sign == null || obj.sign == ""){
            return false;
        }

        let sortQuery = cc.pgy.util.objectToSortQuery(obj);

        let md5 = cc.pgy.util.md5(sortQuery + this.secretKey);

        if(md5 == null || md5 == ""){
            this.log("md5 str:" + sortQuery);
            this.log("md5:" + md5);
            return false;
        }

        md5 = md5.toLowerCase();

        if(md5 === obj.sign){
            return true;
        }
        else{
            this.log("md5 str:" + sortQuery);
            this.log("md5:" + md5);
            return false;
        }
    },

    /**
     * 平台初始化
     *
     */
    initOpen(){
        this.log("initOpen sdk start!!!");
        let body = {};

        // 渠道id,number
        body["channelId"] = cc.pgy.zh_open.channelId;

        let sign = this.signForOpen(JSON.stringify(body));

        let param = {};

        //游戏id
        param["x-auth-id"] = cc.pgy.zh_open.gameId;

        //签名
        param["x-auth-sign"] = sign;

        //时间戳
        param["x-auth-time"] =  (new Date()).getTime();

        //会员认证token
        param["Authorization"] = "Basic " + cc.pgy.zh_open.tokenId;

        let self = this;
        cc.pgy.request.post({
            url: this.host+ "/v1/game/miaomiaofastrun/initGame",
            header: param,
            body: body,
            callback: function(data){
                self.log("initOpen sdk done!!!");
                console.log(data);

                let json = JSON.parse(data);
                if(json == null || !json.result){
                    self.init = false;
                    self._initCallback({ret: "open_error", msg: json.error.message + "（平台初始化）"});
                    return;
                }
                
                self.init = true;

                if(json.data != null && json.data.nickName != null && json.data.nickName != ""){
                    self.log("name:" + json.data.nickName);
                    cc.pgy.data.nickName = json.data.nickName; // 昵称
                    cc.pgy.data.lastCount = json.data.lastCount; // 剩余次数
                    cc.pgy.data.lessenCount = json.data.lessenCount; // 每局扣除积分
                    self._initCallback({ret: "success", msg: "初始化成功"});
                }
                else{
                    self._initCallback({ret: "name_null", msg: "昵称为空（平台初始化）"});
                }
            },
            timeout: function(){
                self._initCallback({ret:"open_error", msg:"网络连接失败！"});
            }
        });

        this.log("initOpen sdk end!!!");
    },

    /**
     * 消耗积分
     *
     * @param {object} obj {callback(json): function}
     *      score:消耗的分数 callback:回调
     * @returns
     */
    consume(obj){
        this.log("consume start!!!");

        if(!this.init){
            obj.callback({ret: false, msg: "未初始化"});
            return;
        }

        let body = {};

        // 渠道id
        body["channelId"] = cc.pgy.zh_open.channelId;

        // 游戏订单id
        cc.pgy.data.gameStartTime = (new Date()).getTime();

        let sign = this.signForOpen(JSON.stringify(body));

        let header = {};

        //游戏id
        header["x-auth-id"] = cc.pgy.zh_open.gameId; 

        //签名
        header["x-auth-sign"] = sign;

        //时间戳（保存，结束时使用）
        header["x-auth-time"] = cc.pgy.data.gameStartTime;

        //会员认证token
        header["Authorization"] = "Basic " + cc.pgy.zh_open.tokenId;

        let self = this;
        cc.pgy.request.post({
            url: this.host+ "/v1/game/miaomiaofastrun/downCount",
            header: header,
            body: body,
            callback: function(data){
                console.log(data);
                obj.callback(JSON.parse(data));
            },
            timeout: function(){
                obj.callback({result: false, error:{message:"网络连接失败！"}});
            }
        });

        this.log("consume end!!!");
    },

    /**
     * 奖励积分
     *
     * @param {object} obj -{range:number, goldCoinCount:number, callback(json):function}
     *      score：获取的分数 callback：回调
     * @returns
     */
    earning(obj){
        this.log("earning start!!!");

        if(!this.init){
            obj.callback({ret: false, msg: "未初始化"});
            return;
        }

        let body = {};

        // 渠道id,number
        body["channelId"] = cc.pgy.zh_open.channelId;

        // 游戏开始时间
        body["gameStartTime"] = cc.pgy.data.gameStartTime;

        // 距离
        body["range"] = obj.range;

        // 金币
        body["goldCoinCount"] = obj.goldCoinCount;

        let sign = this.signForOpen(JSON.stringify(body));

        let header = {};
        
        //游戏id
        header["x-auth-id"] = cc.pgy.zh_open.gameId;

        //签名
        header["x-auth-sign"] = sign;

        //时间戳
        header["x-auth-time"] =  (new Date()).getTime();

        //会员认证token
        header["Authorization"] = "Basic " + cc.pgy.zh_open.tokenId;

        let self = this;
        cc.pgy.request.post({
            url: this.host+ "/v1/game/miaomiaofastrun/addCount",
            header: header,
            body: body,
            callback: function(data){
                console.log(data);
                obj.callback(JSON.parse(data));
            },
            timeout: function(){
                obj.callback({result: false, error:{message:"网络连接失败！"}});
            }
        });

        this.log("earning end!!!");
    },

    /**
     * 昵称设置
     *
     * @param {object} obj -{name:string, callback:function}
     *      name：昵称 callback：回调
     * @returns
     */
    modifyNickname(obj){
        this.log("modifyNickname start!!!");

        if(!this.init){
            obj.callback({ret: false, msg: "未初始化"});
            return;
        }

        let body = {};

        // 渠道id,number
        body["name"] = obj.name;

        let sign = this.signForOpen(JSON.stringify(body));

        let header = {};
        
        //游戏id
        header["x-auth-id"] = cc.pgy.zh_open.gameId;

        //签名
        header["x-auth-sign"] = sign;

        //时间戳
        header["x-auth-time"] =  (new Date()).getTime();

        //会员认证token
        header["Authorization"] = "Basic " + cc.pgy.zh_open.tokenId;

        let self = this;
        cc.pgy.request.post({
            url: this.host+ "/v1/game/miaomiaofastrun/modifyNickname",
            header: header,
            body: body,
            callback: function(data){
                console.log(data);
                obj.callback(JSON.parse(data));
            },
            timeout: function(){
                obj.callback({result: false, error:{message:"网络连接失败！"}});
            }
        });

        this.log("modifyNickname end!!!");
    },


    /**
     * 补单
     *
     * @param {object} obj {info: object, callback: function(json)}
     */
    repairOrder(obj){
        this.log("repairOrder start!!!");

        if(!this.init){
            obj.callback({ret: false, msg: "未初始化"});
            return;
        }

        let body = {};

        // 渠道id,number
        body["name"] = obj.name;

        let sign = this.signForOpen(JSON.stringify(body));

        let header = {};
        
        //游戏id
        header["x-auth-id"] = cc.pgy.zh_open.gameId;

        //签名
        header["x-auth-sign"] = sign;

        //时间戳
        header["x-auth-time"] =  (new Date()).getTime();

        //会员认证token
        header["Authorization"] = "Basic " + cc.pgy.zh_open.tokenId;

        let self = this;
        cc.pgy.request.post({
            url: this.host+ "/v1/game/miaomiaofastrun/modifyNickname",
            header: header,
            body: body,
            callback: function(data){
                console.log(data);
                obj.callback(JSON.parse(data));
            },
            timeout: function(){
                obj.callback({result: false, error:{message:"网络连接失败！"}});
            }
        });

        this.log("repairOrder end!!!");
    },


    /**
     * 获取记录
     *
     * @param {object} obj {callback: function(json)}
     */
    getRecord(obj){
        let json = [
            {time:1540194895000, consume:9, earn: 1, state:"成功"},
            {time:1540281295000, consume:9, earn: 1, state:"成功"},
            {time:1540367695000, consume:9, earn: 1, state:"成功"},
            {time:1540454095000, consume:9, earn: 1, state:"成功"},
            {time:1540540495000, consume:9, earn: 1, state:"成功"},
            {time:1540626895000, consume:9, earn: 1, state:"成功"},
            {time:1540713295000, consume:9, earn: 1, state:"成功"},
            {time:1540799695000, consume:9, earn: 1, state:"成功"},
            {time:1540886095000, consume:9, earn: 1, state:"成功"},
        ];

        obj.callback(json);
    },

    /**
     * 获取任务
     *
     * @param {object} obj {callback: function(json)}
     */
    getTask(obj){
        this.log("getTask start!!!");

        if(!this.init){
            obj.callback({ret: false, msg: "未初始化"});
            return;
        }

        let body = {};

        // 渠道id
        body["channelId"] = cc.pgy.zh_open.channelId;

        let sign = this.signForOpen(JSON.stringify(body));

        let header = {};
        
        //游戏id
        header["x-auth-id"] = cc.pgy.zh_open.gameId;

        //签名
        header["x-auth-sign"] = sign;

        //时间戳
        header["x-auth-time"] =  (new Date()).getTime();

        //会员认证token
        header["Authorization"] = "Basic " + cc.pgy.zh_open.tokenId;

        let self = this;
        cc.pgy.request.post({
            url: this.host+ "/v1/game/miaomiaofastrun/getAllGameJobs",
            header: header,
            body: body,
            callback: function(data){
                console.log(data);
                obj.callback(JSON.parse(data));
            },
            timeout: function(){
                obj.callback({result: false, error:{message:"网络连接失败！"}});
            }
        });

        this.log("getTask end!!!");
    },


    /**
     * 获取游戏规则
     *
     * @param {object} obj {callback: function(json)}
     */
    getAllRules(obj){
        this.log("getAllRules start!!!");

        if(!this.init){
            obj.callback({ret: false, msg: "未初始化"});
            return;
        }

        let body = {};

        // 渠道id
        body["channelId"] = cc.pgy.zh_open.channelId;

        let sign = this.signForOpen(JSON.stringify(body));

        let header = {};
        
        //游戏id
        header["x-auth-id"] = cc.pgy.zh_open.gameId;

        //签名
        header["x-auth-sign"] = sign;

        //时间戳
        header["x-auth-time"] =  (new Date()).getTime();

        //会员认证token
        header["Authorization"] = "Basic " + cc.pgy.zh_open.tokenId;

        let self = this;
        cc.pgy.request.post({
            url: this.host+ "/v1/game/miaomiaofastrun/getAllRules",
            header: header,
            body: body,
            callback: function(data){
                console.log(data);
                obj.callback(JSON.parse(data));
            },
            timeout: function(){
                obj.callback({result: false, error:{message:"网络连接失败！"}});
            }
        });

        this.log("getAllRules end!!!");
    },

    /**
     * 获取任务奖励
     *
     * @param {object} obj {taskId: number, callback: function(json)}
     */
    getTaskReward(obj){
        this.log("getTaskReward start!!!");

        if(!this.init){
            obj.callback({ret: false, msg: "未初始化"});
            return;
        }

        let body = {};

        // 渠道id
        body["channelId"] = cc.pgy.zh_open.channelId;
        body["jobId"] = obj.taskId;

        let sign = this.signForOpen(JSON.stringify(body));

        let header = {};
        
        //游戏id
        header["x-auth-id"] = cc.pgy.zh_open.gameId;

        //签名
        header["x-auth-sign"] = sign;

        //时间戳
        header["x-auth-time"] =  (new Date()).getTime();

        //会员认证token
        header["Authorization"] = "Basic " + cc.pgy.zh_open.tokenId;

        let self = this;
        cc.pgy.request.post({
            url: this.host+ "/v1/game/miaomiaofastrun/drawIntegralValue",
            header: header,
            body: body,
            callback: function(data){
                console.log(data);
                obj.callback(JSON.parse(data));
            },
            timeout: function(){
                obj.callback({result: false, error:{message:"网络连接失败！"}});
            }
        });

        this.log("getTaskReward end!!!");
    },

    /**
     * 平台签名，MD5(传输的参数+秘钥)
     *
     * @param {string} body
     * @returns
     */
    signForOpen(body){
        let sign = body + this.secretKey;
        return cc.pgy.util.md5(sign);
    },

    /**
     * url请求签名验证
     *
     * @param {string} query
     * @returns
     */
    verifyQuerySign(query){
        let obj = cc.pgy.util.queryToObject(query);
        if(obj == null || obj == ""){
            return false;
        }

        if(obj.sign == null || obj.sign == ""){
            return false;
        }

        let sortQuery = cc.pgy.util.objectToSortQuery(obj);
        let md5 = cc.pgy.util.md5(query);

        if(md5 == null || md5 == ""){
            return false;
        }

        if(md5 === obj.sign){
            return true;
        }
        else{
            return false;
        }
    },

    /**
     * 生成订单号
     *
     * @returns
     */
    getOrderId(){
        return ((new Date()).getTime()).toString();
    },
    
    /**
     * 日志输出
     *
     * @param {*} str
     * @param {*} first
     */
    log(str, first){
        console.log("SdkMgr:" + str);
    },

    test(){
        
    },

    
    // update (dt) {},
});
