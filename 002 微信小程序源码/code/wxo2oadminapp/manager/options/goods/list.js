//获取应用实例
var common = require('../../common/common.js');
var app = getApp();
var _P = app.xpm.getPromise();

Page({
	data: {
		"rs":[]
	},

	// 下拉刷新
	onPullDownRefresh: function( e ){
		
		var that = this;

		this.getGoods().then( function( data ) {
			that.setData( {rs:data['data']} );
			return ;
		})

		.then(function() {
			wx.stopPullDownRefresh();
		});
		
	},

	linkto: function(e){
		var data = e.currentTarget.dataset;
		wx.navigateTo({
			url:'/manager/options/goods/detail?id='+ data.id,
			complete:function(){}
		});
	},

	getGoods: function() {

		var that = this;
		return new _P( function( resolve, reject ) {
		
			that.tab.select("ORDER BY created_at desc LIMIT 40").then(function( resp ) {
				resolve(resp);

			})
			.catch(function(excp){
				console.log( 'excp', excp );
				reject(excp);
			})
		});
	},


	onShow:function(){
		this.onPullDownRefresh();
	},


	onLoad: function () {
		var that = this;
		common.extend( this );
		common.title('商品管理-店铺管理');
		this.tab = common.table('goods');
	},
	user:null,
	tab:null
})