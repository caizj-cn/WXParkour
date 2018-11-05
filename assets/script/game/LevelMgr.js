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
        spriteFrameCoin: {
            default: null,
            type: cc.SpriteFrame,
            tooltip: "金币纹理"
        },

        // 跳起来才能够得着
        coinTopHeight: {
            default: 30,
            tooltip: "上排金币底部离地面距离",
        },

        // 走路够得着
        coinMidHeight: {
            default: 20,
            tooltip: "中排金币底部离地面距离",
        },

        // 走路或蹲着够得着
        coinBottomHeight: {
            default: 10,
            tooltip: "下排金币底部离地面距离",
        },

        // 2|3|4个金币时，金币之间的偏移量
        coin2Offset: {
            default: 10,
        },
        coin3Offset: {
            default: 10,
        },
        coin4Offset: {
            default: 10,
        },

        spriteFrameBox: {
            default: null,
            type: cc.SpriteFrame,
            tooltip: "障碍物纹理"
        },

        // 障碍物离地面距离(下层直接铺到地面)
        boxTopHeight:{
            default: 130,
            tooltip: "上层障碍物底部距离地面距离"
        },

        // 2个障碍物时，障碍物之间的偏移量
        box2Offset: {
            default: 0,
            tooltip: "两个障碍物间距（一块内部）",
        },

        boxBlockOffsetX: {
            default: 0,
            tooltip: "最后侧障碍物离最左边水平间距",
            visible: false,
        },

        // 障碍物间的距离是金币之间距离的一半
        coinBlocksMinOffsetX: {
            default: 200,
            tooltip: "金币之间最小间距",
        },

        // 陆地高低
        landHeight: {
            default: 150,
            visible: false
        },

        // 像素到米的比率
        p2mRatio:{
            default: 10,
            tooltip: "1米多少像素",
            visible: false
        },

        nodeContainer:{
            default: null,
            type: cc.Node,
            tooltip: "金币和障碍物容器"
        },

        // 第几幕（相对于游戏背景图宽度）
        actIndex: {
            default: 1,
            tooltip: "第几幕（从左到右完整运行次数）",
        },

        maxActWidth: {
            default: 3840,
            tooltip: "最大屏幕宽（背景层减去最后过渡的一幕）",
        },

        maxRunLength: {
            default: 15360,
            visible: false,
            tooltip: "最大奔跑距离"
        },

        minCoinCount: {
            default: 100,
            tooltip: "最少金币数"
        },

        maxCoinCount: {
            default: 100,
            tooltip: "最多金币数"
        },

        // {x: x, type: type}
        // 一次完整数据
        _boxData: [],

        // {x: x, type:type, num: number, max: number, index: number}
        // 一次完整数据
        _coinData: [],

        // 最后一屏节点
        _lastNodes: [cc.Node],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // 先布置障碍物（包括不可见的），再以障碍物一般的距离布置金币，金币的点定以后
    // 将总金币数量随机的分配到各个点上，一个个的分配，直到分配完成。
    start () {
        
    },


    /**
     * 初始化
     *
     */
    initMgr(){
        // 最大奔跑距离
        this.maxRunLength = cc.pgy.cfg.actCount * this.maxActWidth;

        // 调整背景大小和位置
        this.nodeContainer.width = this.maxActWidth + cc.winSize.width;
        this.nodeContainer.height = cc.winSize.height;
        this.nodeContainer.x = 0;
        this.nodeContainer.y = 0;

        // 初始化
        this._boxData = [];
        this._boxTransData = [];
        this._coinData = [];
        this._coinTransData = [];

        this.give();
    },

    reload(){
        // 先把最后一屏节点保存
        for(let i = 0; i < this._lastNodes.length; i++){
            this._lastNodes[i].removeFromParent(false);
        }

        // 移除所有节点
        this.nodeContainer.removeAllChildren();

        // 把最后一屏节点绘制在第一屏
        for(let i = 0; i < this._lastNodes.length; i++){
            this._lastNodes[i].x = this._lastNodes[i].x - this.maxActWidth;
            this.nodeContainer.addChild(this._lastNodes[i]);
        }

        // 清空记录
        this._lastNodes = [];

        this.addNormal();
    },

    // 分配算法
    give(){
        this.giveBox();
        this.giveCoin();        
    },


    /**
     * 分配障碍物数据（整个游戏的完整数据）
     *
     */
    giveBox(){
        // 清理上一次数据
        this._boxData = [];
        this._boxTransData = [];
        
        // 生成要绘制障碍物数据（第一幕不显示障碍物）
        let offset = cc.winSize.width;

        // 最后面的位置（最后一幕一半留给显示结束）
        let maxOffset = this.maxRunLength;// + (cc.winSize.width >> 1);
        let id = 0;
        while(offset < maxOffset){
            // 1-下方1个障碍物 2-下方2个障碍物 3-上方1个障碍物 4-上方2个障碍物 其他-无障碍物
            let type = this.getRandomNum(1, 6);
            // let type = this.getRandomNum(5, 6);

            this._boxData.push({x: offset, type: type, id: id});
            id++;
            
            offset += (this.coinBlocksMinOffsetX << 1);
        }
    },


    /**
     * 分配金币数据
     *
     */
    giveCoin(){
        // 生成要绘制金币的数据
        this._coinData = [];
        this._coinTransData = [];

        // 生成要绘制金币数据（第一幕不显示金币）
        let offset = cc.winSize.width;

        // 最后面的位置
        let maxOffset = this.maxRunLength;// + (cc.winSize.width >> 1);
        
        // 最开始每个能放金币的坑
        let tmpData = [];
        while(offset < maxOffset){
            tmpData.push({x: offset, num: 0});
            offset += this.coinBlocksMinOffsetX;
        }
        if(tmpData.length <= 0){
            return;
        }
        cc.log("@@@金币坑位：" + tmpData.length);

        // 金币总数（在最小值和最大值之间随机一个数）
        let coinCount = this.getRandomNum(this.minCoinCount, this.maxCoinCount);
        if(coinCount <= 0){
            return;
        }
        cc.log("@@@金币个数：" + coinCount);

        // 设置每个容器最多放多少金币（特殊的，障碍物在上方，只能放1个或2个金币）
        for(let i = 0 ;i < tmpData.length; i++){
            tmpData[i].max = 4;
            let boxIndex = Math.floor(i / 2);
            if((i % 2 == 0) && (boxIndex < this._boxData.length)){
                if(this._boxData[boxIndex].type == 3 || this._boxData[boxIndex].type == 4){
                    tmpData[i].max = 2;
                }
            }
        }

        // 分配金币（金币一个个往容器里分配，直到分配完毕或者坑填完了）
        for(let i = 0; i < coinCount; i++){
            // 坑填完了结束
            if(tmpData.length <= 0){
                break;
            }

            // 随机选择现有的坑位
            let index = this.getRandomNum(0, tmpData.length - 1);

            tmpData[index].num += 1;

            // 当前坑位填满了，坑移除
            if(tmpData[index].num >= tmpData[index].max){
                this._coinData.push(tmpData[index]);
                tmpData.splice(index, 1);
            }
        }

        // 把剩下没填满的坑位收集起来
        if(tmpData.length > 0){
            this._coinData = this._coinData.concat(tmpData);
        }

        // 金币数据按横轴前后顺序排序
        this._coinData.sort(function cmp(obj1, obj2){
            return obj1.x - obj2.x;
        });

        // 确定金币数量以后，根据障碍物类型，分配类型
        // 1-下方1个金币    2-下方2个金币   3-下方3个金币   4-下方4个金币
        // 5-中方1个金币    6-中方2个金币   7-中方3个金币   8-中方4个金币
        // 9-上方1个金币    10-上方2个金币  11-上方3个金币  12-上方4个金币
        for(let i = 0; i < this._coinData.length; i++){
            this._coinData[i].id = i;
            // 有障碍物
            // 1-下方1个障碍物 
            // 2-下方2个障碍物 
            // 3-上方1个障碍物 
            // 4-上方2个障碍物 
            if(i % 2 == 0){
                let index = Math.floor(i / 2);
                // 障碍物在下方，金币只有上
                if(this._boxData[index].type === 1 || this._boxData[index].type === 2){
                    // 根据金币核算
                    switch(this._coinData[i].num){
                        case 1: this._coinData[i].type = 9; break;
                        case 2: this._coinData[i].type = 10; break;
                        case 3: this._coinData[i].type = 11; break;
                        case 4: this._coinData[i].type = 12; break;
                        default: this._coinData[i].type = 0;
                    }
                }
                // 障碍物在上方，金币只在下（1个或2个）
                else if(this._boxData[index].type === 3 || this._boxData[index].type === 4){
                    // 根据金币核算
                    switch(this._coinData[i].num){
                        case 1: this._coinData[i].type = 1; break;
                        case 2: this._coinData[i].type = 2; break;
                        default: this._coinData[i].type = 0;
                    }
                }
                // 没有障碍物，金币在上或中
                else{
                    // 根据金币核算
                    switch(this._coinData[i].num){
                        case 1: this._coinData[i].type = ((this.getRandomNum(1,2) == 1)? 9: 5); break;
                        case 2: this._coinData[i].type = ((this.getRandomNum(1,2) == 1)? 10: 6); break;
                        case 3: this._coinData[i].type = ((this.getRandomNum(1,2) == 1)? 11: 7); break;
                        case 4: this._coinData[i].type = ((this.getRandomNum(1,2) == 1)? 12: 8); break;
                        default: this._coinData[i].type = 0;
                    }
                }

            }
            // 无障碍物（只有中上）
            else{
                // 根据金币核算
                switch(this._coinData[i].num){
                    case 1: this._coinData[i].type = ((this.getRandomNum(1,2) == 1)? 5: 1); break;
                    case 2: this._coinData[i].type = ((this.getRandomNum(1,2) == 1)? 6: 2); break;
                    case 3: this._coinData[i].type = ((this.getRandomNum(1,2) == 1)? 7: 3); break;
                    case 4: this._coinData[i].type = ((this.getRandomNum(1,2) == 1)? 8: 4); break;
                    default: this._coinData[i].type = 0;
                }
            }
        }
    },
    
    /**
     * 添加正常节点
     *
     */
    addNormal(){
        // 当前屏能运行到的最大横轴坐标(包括最后一幕转换屏)
        let MAX_X = this.actIndex * this.maxActWidth + cc.winSize.width;

        // 障碍物
        while(this._boxData.length > 0){
            // 缓存最后一屏幕的，用于场景转换
            let box = this._boxData[0];
            let width = (box.type == 1 || box.type == 3)? this.getBoxSize(1).width: this.getBoxSize(2).width;

            // 超过可显示区域
            let tmpX = box.x - (width >> 1);
            if(tmpX >= MAX_X){
                break;
            }

            // 计算节点的显示位置
            let nodeX = box.x - (this.actIndex - 1)* this.maxActWidth;

            // 绘制出来
            let block = this.addBoxFromType(box.type, nodeX);
            if(block != null){
                 // 最后一屏第一个点的最右坐标
                if(nodeX > (this.maxActWidth - (width >> 1))){
                    this._lastNodes.push(block);
                }
            }

            // 移除首个元素
            this._boxData.shift();
        }

        // 金币
        // 需要重新绘制的点（如果金币已经被吃掉，就不用继续重新绘制了）
        while(this._coinData.length > 0){
            // 缓存最后一屏幕的，用于场景转换
            let coin = this._coinData[0];
            let width = 0;
            // 2个金币
            if(coin.type == 2 || coin.type == 6 || coin.type == 10){
                width = this.getCoinSize(2).width;
            }
            // 3个金币
            else if(coin.type == 3 || coin.type == 7 || coin.type == 11){
                width = this.getCoinSize(3).width;
            }
            // 4个金币
            else if(coin.type  == 4 || coin.type == 8 || coin.type == 12){
                width = this.getCoinSize(4).width;
            }
            // 1个金币
            else{
                width = this.getCoinSize(1).width;
            }

            // 超过可显示区域
            let tmpX = coin.x - (width >> 1);
            if(tmpX >= MAX_X){
                break;
            }

            // 计算节点的显示位置
            let nodeX = coin.x - (this.actIndex - 1)* this.maxActWidth;

            // 绘制出来
            let block = this.addCoinFromType(coin.type, nodeX);
            if(block != null){
                // 最后一屏第一个点的最右坐标
                if(nodeX > (this.maxActWidth - (width >> 1))){
                    this._lastNodes.push(block);
                }
            }

            // 移除首个元素
            this._coinData.shift();
        }

        for(let i = 0;i < this._coinTransData.length; i++){
            // test
            cc.log("[record specail] x:" + this._coinTransData[i].x + " type:" + this._coinTransData[i].type);
        }
    },

    /**
     * 根据类型摆放障碍物
     *
     * @param {number} type 
     *      1-下方1个障碍物 
     *      2-下方2个障碍物 
     *      3-上方1个障碍物 
     *      4-上方2个障碍物 
     *      其他-无障碍物
     * @param {number} x 横轴坐标
     * @returns
     */
    addBoxFromType(type, x){
        if(type == 1){
            return this.addBoxBottom1(x);
        }
        else if(type == 2){
            return this.addBoxBottom2(x);
        }
        else if(type == 3){
            return this.addBoxTop1(x);
        }
        else if(type == 4){
            return this.addBoxTop2(x);
        }
        else{
            return null;
        }
    },


    /**
     * 获取障碍物块大小
     *
     * @param {number} num 障碍物内部个数（1或2）
     * @returns
     */
    getBoxSize(num){
        if(num == 2){
            let size = this.spriteFrameBox.getOriginalSize();
            size.width = (size.width << 1) + this.box2Offset;
            return size;
        }
        else {
            return this.spriteFrameBox.getOriginalSize();
        }
    },

    /**
     * 获取金币块大小
     *
     * @param {number} num 金币内部个数（1或2）
     * @returns
     */
    getCoinSize(num){
        if(num == 2){
            let size = this.spriteFrameCoin.getOriginalSize();
            size.width = (size.width << 1) + this.coin2Offset;
            return size;
        }
        else if(num == 3){
            let size = this.spriteFrameBox.getOriginalSize();
            size.width = size.width * 3 + (this.coin3Offset << 1);
            return size;
        }
        else if(num == 4){
            let size = this.spriteFrameBox.getOriginalSize();
            size.width = (size.width << 1) + this.coin4Offset;
            return size;
        }
        else{
            return this.spriteFrameCoin.getOriginalSize();
        }
    },
    
    /**
     * 当前位置下方摆放1个障碍物
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addBoxBottom1(x){
        let boxBlock = this.generateNode1("box", this.spriteFrameBox);
        boxBlock.x = x;
        boxBlock.y = this.landHeight + (boxBlock.height >> 1);
        this.nodeContainer.addChild(boxBlock);
        return boxBlock;
    },

    /**
     * 当前位置下方摆放2个障碍物
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addBoxBottom2(x){
        let boxBlock = this.generateNode2("box", this.box2Offset, this.spriteFrameBox);
        boxBlock.x = x;
        boxBlock.y = this.landHeight + (boxBlock.height >> 1);
        this.nodeContainer.addChild(boxBlock);
        return boxBlock;
    },

    /**
     *  当前位置上方摆放1个障碍物
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addBoxTop1(x){
        let boxBlock = this.generateNode1("box", this.spriteFrameBox);
        boxBlock.x = x;
        boxBlock.y = this.landHeight + (boxBlock.height >> 1) + this.boxTopHeight;
        this.nodeContainer.addChild(boxBlock);
        return boxBlock;
    },

    /**
     *  当前位置上方摆放2个障碍物
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addBoxTop2(x){
        let boxBlock = this.generateNode2("box", this.box2Offset, this.spriteFrameBox);
        boxBlock.x = x;
        boxBlock.y = this.landHeight + (boxBlock.height >> 1) + this.boxTopHeight;
        this.nodeContainer.addChild(boxBlock);
        return boxBlock;
    },


    /**
     * 根据类型摆放金币
     *
     * @param {number} type 类型
     *      1-下方1个金币
     *      2-下方2个金币
     *      3-下方3个金币
     *      4-下方4个金币
     *      5-中方1个金币
     *      6-中方2个金币
     *      7-中方3个金币
     *      8-中方4个金币
     *      9-上方1个金币
     *      10-上方2个金币
     *      11-上方3个金币
     *      12-上方4个金币
     * @param {number} x 横轴坐标
     */
    addCoinFromType(type, x){
        if(type == 1){
            return this.addCoinBottom1( x);
        }
        else if(type == 2){
            return this.addCoinBottom2(x);
        }
        else if(type == 3){
            return this.addCoinBottom3(x);
        }
        else if(type == 4){
            return this.addCoinBottom4(x);
        }
        else if(type == 5){
            return this.addCoinMid1(x);
        }
        else if(type == 6){
            return this.addCoinMid2(x);
        }
        else if(type == 7){
            return this.addCoinMid3(x);
        }
        else if(type == 8){
            return this.addCoinMid4(x);
        }
        else if(type == 9){
            return this.addCoinTop1(x);
        }
        else if(type == 10){
            return this.addCoinTop2(x);
        }
        else if(type == 11){
            return this.addCoinTop3(x);
        }
        else if(type == 12){
            return this.addCoinTop4(x);
        }
        else{
            return null;
        }
    },

    /**
     *  添加底部1个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinBottom1(x){
        let y = this.landHeight + this.coinBottomHeight;
        return this.addNodeToContainer("coin", x, y, 0, 1, this.spriteFrameCoin);
    },

    /**
     *  添加底部2个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinBottom2(x){
        let y = this.landHeight + this.coinBottomHeight;
        return this.addNodeToContainer("coin", x, y, this.coin2Offset, 2, this.spriteFrameCoin);
    },

    /**
     *  添加底部3个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinBottom3(x){
        let y = this.landHeight + this.coinBottomHeight;
        return this.addNodeToContainer("coin", x, y, this.coin3Offset, 3, this.spriteFrameCoin);
    },

    /**
     *  添加底部4个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinBottom4(x){
        let y = this.landHeight + this.coinBottomHeight;
        return this.addNodeToContainer("coin", x, y, this.coin4Offset, 4, this.spriteFrameCoin);
    },

    /**
     *  添加中部1个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinMid1(x){
        let y = this.landHeight + this.coinMidHeight;
        return this.addNodeToContainer("coin", x, y, 0, 1, this.spriteFrameCoin);
    },

    /**
     *  添加中部2个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinMid2(x){
        let y = this.landHeight + this.coinMidHeight;
        return this.addNodeToContainer("coin", x, y, this.coin2Offset, 2, this.spriteFrameCoin);
    },

    /**
     *  添加中部3个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinMid3(x){
        let y = this.landHeight + this.coinMidHeight;
        return this.addNodeToContainer("coin", x, y, this.coin3Offset, 3, this.spriteFrameCoin);
    },


    /**
     *  添加中部4个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinMid4(x){
        let y = this.landHeight + this.coinMidHeight;
        return this.addNodeToContainer("coin", x, y, this.coin4Offset, 4, this.spriteFrameCoin)
    },


    /**
     *  添加顶部1个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinTop1(x){
        let y = this.landHeight + this.coinTopHeight;
        return this.addNodeToContainer("coin", x, y, 0, 1, this.spriteFrameCoin);
    },

    /**
     *  添加顶部2个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinTop2(x){
        let y = this.landHeight + this.coinTopHeight;
        return this.addNodeToContainer("coin", x, y, this.coin2Offset, 2, this.spriteFrameCoin);
    },

    /**
     *  添加顶部3个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinTop3(x){
        let y = this.landHeight + this.coinTopHeight;
        return this.addNodeToContainer("coin", x, y, this.coin3Offset, 3, this.spriteFrameCoin);
    },


    /**
     *  添加顶部4个金币
     *
     * @param {number} x 横轴坐标
     * @returns
     */
    addCoinTop4(x){
        let y = this.landHeight + this.coinTopHeight;
        return this.addNodeToContainer("coin", x, y, this.coin4Offset, 4, this.spriteFrameCoin)
    },


    /**
     * 往场景中添加节点（金币和障碍物通用）
     *
     * @param {string} name 名称
     * @param {number} x 横轴坐标（中心点）
     * @param {number} y 纵轴坐标（下边沿点）
     * @param {number} offset 内置节点间距离
     * @param {number} num 内置节点个数
     * @param {cc.SpriteFrame} spriteFrame 节点纹理
     * @returns
     */
    addNodeToContainer(name, x, y, offset, num, spriteFrame){
        let block = null;
       
        // 1个节点
        if(num == 1){
            block = this.generateNode1(name, spriteFrame);
        }

        // 2个节点
        else if(num == 2){
            block = this.generateNode2(name, offset, spriteFrame);
        }

        // 3个节点
        else if(num == 3){
            block = this.generateNode3(name, offset, spriteFrame);
        }

        // 4个节点
        else if(num == 4){
            block = this.generateNode4(name, offset, spriteFrame);
        }
        else{

        }

        if(block != null){
            block.x = x;
            block.y = y + (block.height >> 1);
            this.nodeContainer.addChild(block);
        }

        return block;
    },

    /**
     * 根据纹理获取精灵
     *
     * @param {cc.SpriteFrame} spriteFrame
     * @returns
     */
    generateNodeFromSprieFrame(spriteFrame){
        let frameSize = spriteFrame.getOriginalSize();
        
        let node = new cc.Node(spriteFrame.name);
        if(spriteFrame == this.spriteFrameBox){
            node.group = "box";
        }
        else if(spriteFrame == this.spriteFrameCoin){
            node.group = "coin";
        }
        else{
            node.group = "default";
        }
        node.width = frameSize.width;
        node.height = frameSize.height;
        node.anchorX = 0.5;
        node.anchorY = 0.5;

        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;

        // 根据纹理名称添加碰撞
        let boxCollider = node.addComponent(cc.BoxCollider);
        boxCollider.size = cc.size(node.width * 0.8, node.height * 0.8);

        return node;
    },


    /**
     * 获取一个等级节点（障碍物或金币）
     *
     * @param {string} name
     * @param {cc.SpriteFrame} spriteFrame
     * @returns
     */
    generateNode1(name, spriteFrame){
        let frameSize = spriteFrame.getOriginalSize();
        let node = new cc.Node(name);
        node.width = frameSize.width;
        node.height = frameSize.height;
        node.anchorX = 0.5;
        node.anchorY = 0.5;

        let box = this.generateNodeFromSprieFrame(spriteFrame);
        node.addChild(box);
        box.x = 0;
        box.y = 0;

        return node;        
    },


    /**
     * 获取2个等级节点（障碍物或金币）
     *
     * @param {string} name
     * @param {number} nodeOffset
     * @param {cc.SpriteFrame} spriteFrame
     * @returns
     */
    generateNode2(name, nodeOffset, spriteFrame){
        let frameSize = spriteFrame.getOriginalSize();
        let node = new cc.Node(name);
        node.width = (frameSize.width << 1) + nodeOffset;
        node.height = frameSize.height;
        node.anchorX = 0.5;
        node.anchorY = 0.5;

        let left = this.generateNodeFromSprieFrame(spriteFrame);
        left.x = (frameSize.width >> 1) - (node.width >> 1);
        left.y = 0;
        node.addChild(left);

        let right = this.generateNodeFromSprieFrame(spriteFrame);
        right.x = (node.width >> 1) - (frameSize.width >> 1);
        right.y = 0;
        node.addChild(right);
        
        return node;
    },


    /**
     * 获取3个等级节点（障碍物或金币）
     *
     * @param {string} name
     * @param {number} nodeOffset
     * @param {cc.SpriteFrame} spriteFrame
     * @returns
     */
    generateNode3(name, nodeOffset, spriteFrame){
        let frameSize = spriteFrame.getOriginalSize();
        let node = new cc.Node(name);
        node.width = frameSize.width * 3 + (nodeOffset << 1);
        node.height = (frameSize.height << 1) + nodeOffset;
        node.anchorX = 0.5;
        node.anchorY = 0.5;

        let left = this.generateNodeFromSprieFrame(spriteFrame);
        left.x = (frameSize.width >> 1) - (node.width >> 1);
        left.y = (frameSize.height >> 1) - (node.height >> 1);
        node.addChild(left);

        let right = this.generateNodeFromSprieFrame(spriteFrame);
        right.x = -left.x;
        right.y = left.y;
        node.addChild(right);

        let top = this.generateNodeFromSprieFrame(spriteFrame);
        top.x = 0;
        top.y = (node.height >> 1) - (frameSize.height >> 1);
        node.addChild(top);
        
        return node;
    },


    /**
     * 获取4个等级节点（障碍物或金币）
     *
     * @param {string} name
     * @param {number} nodeOffset
     * @param {cc.SpriteFrame} spriteFrame
     * @returns
     */
    generateNode4(name, nodeOffset, spriteFrame){
        let frameSize = spriteFrame.getOriginalSize();
        let node = new cc.Node(name);
        node.width = (frameSize.width << 1) + nodeOffset;
        node.height = (frameSize.height << 1) + nodeOffset;
        node.anchorX = 0.5;
        node.anchorY = 0.5;

        let r_t = this.generateNodeFromSprieFrame(spriteFrame);
        r_t.x = (node.width >> 1) - (frameSize.width >> 1);
        r_t.y = (node.height >> 1) - (frameSize.height >> 1);
        node.addChild(r_t);

        let l_b = this.generateNodeFromSprieFrame(spriteFrame);
        l_b.x = -r_t.x;
        l_b.y = -r_t.x;
        node.addChild(l_b);

        let l_t = this.generateNodeFromSprieFrame(spriteFrame);
        l_t.x = -r_t.x;
        l_t.y = r_t.y;
        node.addChild(l_t);

        let r_b = this.generateNodeFromSprieFrame(spriteFrame);
        r_b.x = r_t.x;
        r_b.y = -r_t.y;
        node.addChild(r_b);
        
        return node;
    },

    /**
     * 获取[min, max]的随机数整数
     *
     * @param {number} min - 最小整数
     * @param {number} max - 最大整数
     * @returns
     */
    getRandomNum(min, max){
        return Math.floor(Math.random()*(max-min+1)+min);
    },

    // update (dt) {},
});
