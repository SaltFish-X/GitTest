var app = getApp();
var _P = app.xpm.getPromise();

Page({
	data: {
		user:{},
		cid:{focus:true, value:'', disabled:false},
		errmsg:""
	},

	tmpgo: function(e){
		wx.navigateTo({url:'/pages/store/user/user/user'});
	},

	scan: function(e) {
		var that = this;

		wx.scanCode({
		  success: (res) => {
		  	var cid = res['result'] || '';
		  	var pattern=/^[0-9]*[1-9][0-9]*$/;
			if ( pattern.test(cid) ){
				
				that.setData({'cid.value':cid});
				that.loginAs(cid);

			} else {
				that.setError('二维码不正确');
			}
		  }
		})
	},


	setError: function( error, timeout ){
		
		timeout = timeout || 2000;
		var that = this;

		that.setData({'errmsg':error,'cid.disabled':false});
		setTimeout(function(){
			that.setData({'errmsg':''});
		}, timeout);
	},


	clear: function(){
		this.setData({'cid.value':''});
	},



	loginAs:function( cid ) {
		var that = this;

		this.setData({'cid.disabled':true});

		this.user.tab.getLine('cid=?',[cid.toString()]).then(function( uinfo ){
			
			if ( uinfo.length == 0 ) {
				that.setError('会员卡不存在');
				return;
			}

			that.setData({'cid.disabled':false});
			app.session.set('_asuser', uinfo );
			wx.navigateTo({url:'/manager/order/products/products'});
		})

		.catch( function(excp){
			// console.log('loginAs:', excp );
			that.setError('网络错误，请稍后再试');
		});

	},

	getcard: function( e ) {

		var that = this;
		var val = e.detail.value;

		if ( val.length == 7 ) {
			that.loginAs(val);
		}

	},

	onShow: function() {
	},

	onLoad: function () {

		var that = this;

		// 校验用户身份
		this.user = app.xpm.require('User');
		this.user.login().then(function( uinfo ) {

			// 校验客户身份				 
			return that.user.tab.get(uinfo['_id']); // 查询客户完整数据
			
		}).then(function( uinfo ) {
			wx.setNavigationBarTitle({title:'代客下单'});
			that.setData({user:uinfo});
			app.session.set('_manager', uinfo );

		}).catch( function( excp ){
			console.log('excp is:', excp);
			// 跳转到用户侧页面
			wx.redirectTo({url:'/pages/index/index'});
		});

	},

	user:null
})