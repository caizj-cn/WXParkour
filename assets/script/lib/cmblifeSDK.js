//------------------------------------------------------------------------------
// CMB Confidential
//
// Copyright (C) 2016.9.12. China Merchants Bank Co., Ltd. All rights reserved.
//
// No part of this file may be reproduced or transmitted in any form or by any means,
// electronic, mechanical, photocopying, recording, or otherwise, without prior
// written permission of China Merchants Bank Co., Ltd.
//
//------------------------------------------------------------------------------
var cmblife = {
	
	/**
	 * 执行cmblife协议
	 *
	 * 可用于唤起掌上生活，也可用于在掌上生活内执行某功能
	 */
	executeProtocol: function(protocol) {
		if (this.isCmblife()) {
			var iframe = document.createElement('iframe');
			iframe.style.cssText = 'display:none;width:0px;height:0px;';
			iframe.src = protocol;
			(document.body || document.documentElement).appendChild(iframe);
			setTimeout(function() {
				iframe && iframe.parentNode && iframe.parentNode.removeChild(iframe);
			}, 0);
		} else if (this.isIOS()) {
			location.href = protocol;
			setTimeout(function() {
				window.location = "https://cmblife.cmbchina.com/cmblife/download/otherzf0810.html";
			}, 2000);
		} else {
			var time = Date.now();
			location.href = protocol;
			setTimeout(function() {
				if (Date.now() - time < 1200) {
					location.href = 'https://cmblife.cmbchina.com/cmblife/download/otherzf0810.html';
				}
			}, 1000);
		}
	},
	
	/**
	 * 显示等待框（仅掌上生活内）
	 *
	 * 请求参数：
	 * msg              | O | string |    等待框中显示的文字，可不传，默认为"加载中，请稍候..."
	 */
	 showWait: function(msg) {
		 if (!this.isCmblife()) {
			 return;
		 }
		 var protocol = "cmblife://web/widget/showwait";
		 if (null != msg) {
			 protocol += "?msg=" + encodeURIComponent(msg);
		 }
		 this.executeProtocol(protocol);
	 },
	
	/**
	 * 隐藏等待框（仅掌上生活内）
	 */
	dismissWait: function() {
		if (!this.isCmblife()) {
			 return;
		}
		var protocol = "cmblife://web/widget/dismiss";
		this.executeProtocol(protocol);
	},
	
	/**
	 * 显示普通toast（仅掌上生活内）
	 *
	 * 请求参数：
	 * msg            | M | string | 	  提示信息
	 * duration       | O | number |      显示时长，单位毫秒,不传默认为3000毫秒
	 */
	showToast: function(msg, duration) {
		if (!this.isCmblife()) {
			 return;
		}
		var protocol = "cmblife://web/widget/showtoast"
			+ "?msg=" + encodeURIComponent(msg);
		if (null != duration) {
			protocol += "&duration=" + encodeURIComponent(duration);
		}
		this.executeProtocol(protocol);
	},
	
	/**
	 * 显示带单按钮的对话框（仅掌上生活内）
	 *
	 * 请求参数：
	 * title            | M | string | 	  弹窗标题
	 * msg              | M | string |    弹窗中的话术
	 * btn              | M | string |    按钮文字
	 * btncallback      | O | string |    点击按钮后的js回调函数名,不传则不进行任何回调
	 *
	 */
	show1BtnDialog: function(title, msg, btn, btncallback) {
		if (!this.isCmblife()) {
			 return;
		}
		var protocol = "cmblife://web/widget/show1btndialog"
						+ "?title=" + encodeURIComponent(title)
						+ "&msg=" + encodeURIComponent(msg)
						+ "&btn=" + encodeURIComponent(btn);
		if (null != btncallback) {
			protocol += "&btncallback=" + encodeURIComponent("javascript:" + btncallback);
		}
		this.executeProtocol(protocol);
	},
	
	/**
	 * 显示带双按钮的对话框（仅掌上生活内）
	 *
	 * 请求参数：
	 * title            | M | string | 	  弹窗标题
	 * msg              | M | string |    弹窗中的话术
	 * lbtn             | M | string |    左侧按钮文字
	 * lbtncallback     | O | string |    点击左侧按钮后的js回调函数名,不传则不进行任何回调
	 * rbtn             | M | string |    右侧按钮文字
	 * rbtncallback     | O | string |    点击右侧按钮后的js回调函数名,不传则不进行任何回调
	 *
	 */
	show2BtnDialog: function(title, msg, lbtn, lbtncallback, rbtn, rbtncallback) {
		if (!this.isCmblife()) {
			 return;
		}
		var protocol = "cmblife://web/widget/show2btndialog"
						+ "?title=" + encodeURIComponent(title)
						+ "&msg=" + encodeURIComponent(msg)
						+ "&lbtn=" + encodeURIComponent(lbtn)
						+ "&rbtn=" + encodeURIComponent(rbtn);
		if (null != lbtncallback) {
			protocol += "&lbtncallback=" + encodeURIComponent("javascript:" + lbtncallback);
		}
		if (null != rbtncallback) {
			protocol += "&rbtncallback=" + encodeURIComponent("javascript:" + rbtncallback);
		}
		this.executeProtocol(protocol);
	},

	/**
	 * 关闭当前页面（仅掌上生活内）
	 */
	close: function(){
		if (!this.isCmblife()) {
			 return;
		}
		var protocol = "cmblife://web/close";
		this.executeProtocol(protocol);
	},
	
	/**
	 * 判断是否为掌上生活
	 *
	 * 输入样例：userAgent = Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_4 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13G35,(cmblife 5.5.0/47 v2)
	 *
	 * 返回样例：true
	 */
	isCmblife: function(){
		var userAgent = navigator.userAgent.toLowerCase();
		return /cmblife/.test(userAgent);
	},
	
	/**
	 * 获取APP版本号（仅掌上生活内）
	 *
	 * 输入样例：userAgent = Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_4 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13G35,(cmblife 5.5.0/47 v2)
	 *
	 * 返回样例：5.5.0
	 */
	getAppVersion: function(){
		if (this.isCmblife()){
			var userAgent = navigator.userAgent;
			var appVersion = userAgent.substring(userAgent.indexOf('cmblife') + 7, userAgent.lastIndexOf('/'));
			return this.trim(appVersion);
		}
		return null;
	},
	
	/**
	 * 判断是否为iOS
	 */
	isIOS: function () {
		var userAgent = navigator.userAgent;
		return Boolean(userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/));
	},

	/**
	 * 判断是否为安卓
	 */
	isAndroid: function () {
		var userAgent = navigator.userAgent;
		return Boolean(userAgent.match(/Android/i));
	},

	/**
	 * 去除字符串两端的空白字符
	 */
	trim: function(str) {
　　    return str.replace(/(^\s*)|(\s*$)/g, "");
	}

};

module.exports = cmblife;