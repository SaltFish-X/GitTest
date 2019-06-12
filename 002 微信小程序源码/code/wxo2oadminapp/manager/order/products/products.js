var common = require('../../common/common.js');
var Goods = require("../../../utils/goods.js");
var Payment = require("../../../utils/payment.js");

var app = getApp();
var _P = app.xpm.getPromise();

//获取应用实例
Page({
	
	data: {
		'manager':{}, // 管理员身份信息
		'user':{},  // 用户身份信息
		'goods':[],   // 商品信息
		'balance':{total:0}, // 余额
		'cart': {total:0, sale_price:0, show_price:'0.00' }
	},

	confirm: function() {
		if ( this.data.cart.sale_price <= 0 ) {
			return;
		}
		wx.navigateTo({url:'/manager/order/confirm/confirm'});
	},

	changeuser: function() {
		app.session.set('_asuser', null);
		wx.switchTab({url:'/manager/order/user/user'});
		return;
	},

	cleanup:function(){
		this.utils.cart.clean();
		this.setData({cart:{total:0, sale_price:0, show_price:'0.00' }});
	},

	addtocart: function( e ) {
		var data = e.target.dataset, cart={};
		this.utils.cart.add(data['id'], data['price'], data['amount']);
		cart = this.utils.cart.total();
		this.setData({cart:cart});
	},

	onShow: function() {
		// 读取当前用户购物车
		this.setData({cart:this.utils.cart.total()});
	},

	isOnline: function() {

		var that = this;
		app.wss.open('/wxapp').then(function( res ) {
			if ( typeof that.data.common.user['_id'] == 'undefined') {
				return false;
			}
			return app.wss.isOnline(that.data.common.user['_id'] );

		}).then(function( isOnline ) {

			if ( isOnline == true ) {
				that.setData({'common.user.online':'on'});
				that.setData({'online':{status:'在线', style:'text-primary', disabled:false}});
			} else {
				that.setData({'common.user.online':'off'});
				that.setData({'online':{status:'离线', style:'text-muted', disabled:true}});
			}

		}).catch(function( excp) {
			that.setData({'common.user.online':'off'});
			that.setData({'online':{status:'离线', style:'text-muted', disabled:true}});
		});

	},

	onLoad:function() {

		var that = this;

		if ( app.session.get('_asuser') == null ) {
			wx.navigateTo({ url: '/manager/order/user/user'});
			return;
		}
		
		// 读取用户资料
		var uinfo = app.session.get('_asuser');
		common.extend( this );
		common.title('帮助『' +  uinfo['nickName'] +  '』下单');
		common.userbar( uinfo );

		this.utils = new Goods( uinfo, app.session );
		this.payment = new Payment( uinfo['_id'], app.session );
		
		this.payment.balance().then(function( balance ){
			var total = new Number(balance.total)/100 ;
			that.setData({'balance.total': total.toFixed(2) });
		});


		// 拉取商品图片 ( 第一页最好缓存在 Storage 中 - 都做好后优化 )
		this.goods = app.xpm.require('table', 'goods');
		this.goods.query()
			.paginate(10, 1)

		.fetch('*').then( function( resp ) {

			resp['data'] = that.utils.fliter( resp['data'] );
			that.setData({'goods':resp['data']} );

		})
		.catch( function( excp ){
			console.log( 'error', excp );
		});

		this.isOnline();

	},
	payment:null,
	utils: null,
	goods:null
})