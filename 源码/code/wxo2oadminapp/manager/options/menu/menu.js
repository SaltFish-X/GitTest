//获取应用实例
var common = require('../../common/common.js');
var app = getApp();
var _P = app.xpm.getPromise();

Page({
	data: {
		"links":[
			{name:'商品管理', icon:'/res/icons/bag.png', url:'/manager/options/goods/list' },
			{name:'会员等级', icon:'/res/icons/vip.png', url:'/manager/options/member/list' },
			{name:'店铺管理', icon:'/res/manager/tabs/options.png', url:'/manager/options/store/list' }
		]
	},

	linkto:function( e ) {

		var data = e.currentTarget.dataset;
		wx.navigateTo({
			url:data.link,
			complete:function(){}
		});
	},

	onLoad: function () {

		var that = this;
		common.extend( this );
		common.title('店铺管理');
		
	},
	user:null
})