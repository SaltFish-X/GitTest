//获取应用实例
var common = require('../../common/common.js');
var app = getApp();
var _P = app.xpm.getPromise();

Page({
	data: {
		"options":[]
	},

	// 下拉刷新
	onPullDownRefresh: function( e ){
		
		var that = this;

		this.getOptions().then( function( data ) {
			that.setData( {options:data['data']} );
			return;
		})

		.then(function() {
			wx.stopPullDownRefresh();
		});
		
	},

	linkto: function(e){
		var data = e.currentTarget.dataset;
		wx.navigateTo({
			url:'/manager/options/member/detail?id='+ data.id,
			complete:function(){}
		});
	},

	getOptions: function() {

		var that = this;
		return new _P( function( resolve, reject ) {
		
			that.options.select().then(function( resp ) {
				
				if ( resp['total'] ==  0 ) {
					that.options.create({
						member:{
							group:'member',
							name:'普通会员',
							discount:0.95
						}
					}).then(function( member ){
						member['member']['_id'] = member['_id'];
						resolve({data:[member['member']], total:1} );
					}).catch(function(excp){
						reject(excp);
					})
					return;
				}

				var data = [];
				for( var idx in resp['data'] ) {

					resp['data'][idx]['member']['_id'] = resp['data'][idx]['_id'];
					data.push(resp['data'][idx]['member']);
				}
				resp['data'] = data;

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
		common.title('会员管理-店铺管理');
		this.options = common.table('options');

	},
	user:null,
	options:null
})