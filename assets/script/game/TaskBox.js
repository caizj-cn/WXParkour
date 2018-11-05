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
        _datas: {
            default: [],
            visible: false,
            tooltip: "记录数据"
        },

        prefabItem: {
            default: null,
            type: cc.Prefab,
            tooltip: "选项内容"
        },

        scrollViewRecords: {
            default: null,
            type: cc.ScrollView,
            tooltip: "游戏记录"
        },

        _maxCount: 1,

        _idx: 0,
        _cells: [cc.Node],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // 屏蔽触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            event.stopPropagation();
        });

        this._datas = [];
        
        if(cc.pgy.cfg.type == "cmb"){
            let self = this;
            cc.pgy.util.addLoading("", function(){
                cc.pgy.sdkMgr.getTask({
                    callback: function(json){
                        cc.pgy.util.removeLoading();
                        self.onGetTaskResp(json);
                    }
                });
            });
        }
    },

    // update (dt) {},

    onBackClick(event, customEventData){
        this.node.removeFromParent();
    },

    /**
     * 请求记录返回
     *
     * @param {array} json
     */
    onGetTaskResp(json){
        if(!json.result){
            cc.pgy.util.addMsgBox(json.error.message);
            this._datas = [];
            return;
        }
        else{
            this._datas = json.data.jobs;
        }

        this.pgyInit();
        this.pgyAddPrefab();
        
        this.reload();
    },

    // update (dt) {},

    pgyInit(){
        this._itemHeight = this.prefabItem.data.height;
        this._maxCount = Math.floor(this.scrollViewRecords.node.height / this._itemHeight) + 2;

        if(this._datas.length > this._maxCount){
            this.scrollViewRecords.content.height = this._maxCount * this._itemHeight;
        }
        else{
            this.scrollViewRecords.content.height = this.scrollViewRecords.node.height;
        }

        this.scrollViewRecords.node.on("scrolling", this.onScrolling, this);
    },

    pgyAddPrefab(){
        this._cells = [];
        for(let i = 0; i < this._maxCount; i++){
            let node = cc.instantiate(this.prefabItem);
            this.scrollViewRecords.content.addChild(node);
            node.x = node.width * (node.anchorX - 0.5);
            node.y = -node.height * (1 - node.anchorY) - node.height * i;
            this._cells.push(node);
        }
    },

    onScrolling(event){
        let offset = event.getScrollOffset();
        if(offset.y <= 0 && this._idx > 0){
            // 上移一格
            offset.y += this._itemHeight;
            event.scrollToOffset(offset);

            // 更新数据
            this._idx--;
            this.reload();
        }
        else if(offset.y >= event.getMaxScrollOffset().y && (this._idx < this._datas.length - this._maxCount)){
            // 下移一格
            offset.y -= this._itemHeight;
            event.scrollToOffset(offset);

            // 更新数据
            this._idx++;
            this.reload();
        }
    },

    reload(){
        for(let i = 0; i < this._cells.length; i++){
            this._cells[i].active = (i < this._datas.length);
            this.reloadCell(this._idx + i, this._cells[i]);
        }
    },

    reloadCell(idx, scrollViewCell){
        if(idx < 0 || idx >= this._datas.length){
            return;
        }

        scrollViewCell.getComponent("TaskItem").reload(this._datas[idx]);
    },
});
