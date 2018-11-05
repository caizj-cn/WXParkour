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
        submitCallback:{
            default: null,
            visible: false,
        },

        btnSubmit: {
            default: null,
            type: cc.Button,
        },

        editName:{
            default: null,
            type : cc.EditBox,
        },

        txtHint: {
            default: null,
            type: cc.Label
        }
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    start () {
        // 屏蔽触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            event.stopPropagation();
        });

        if(this.btnSubmit != null){
            this.btnSubmit.node.on("click", this.onSubmitClick, this);
        }

        this.editName.node.on("text-changed", this.onNameChaned, this);
    },

    onNameChaned(editbox){
        let str = editbox.string;

        if(this.getStrLength(str) >= 8){
            this.txtHint.string = "不得超过4个汉字或者8个英文字符，不得出现特殊字符";
            this.txtHint.node.active = true;
        }
    },

    onSubmitClick(event){
        let name = this.editName.string;

        if(name == ""){
            return;
        }

        if(this.getStrLength(name) > 8){
            this.txtHint.string = "不得超过4个汉字或者8个英文字符，不得出现特殊字符";
            this.txtHint.node.active = true;
            return;
        }

        let self = this;
        cc.pgy.sdkMgr.modifyNickname({name: name, callback: function(json){
            if(json.result != undefined && json.result){
                self.submitCallback(json);
            }
            else{
                if(json.error != null && json.error.message != null){
                    self.txtHint.string = json.error.message;
                }
                else{
                    self.txtHint.string = "昵称修改失败";
                }
                self.txtHint.node.active = true;
            }
        }});
    },

    getStrLength(str){
        var len = 0;    
        for (let i = 0; i < str.length; i++) {    
            if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {    
                len += 2;    
            } else {    
                len ++;    
            }    
        }    
        return len;
    },

    // update (dt) {},
});
