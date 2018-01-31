var common = require('../../common/common.js');
var Goods = require("../../../utils/goods.js");
var app = getApp();
var _P = app.xpm.getPromise();

Page({

	data: {
		'manager':{}, // 管理员身份信息
		'user':{},  // 用户身份信息
		'goods':[],   // 商品信息
		'cart': {total:0, sale_price:0, show_price:'0.00'},  // 购物车信息
		'order':{}  // 订单信息
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

	/**
	 * 生成订单
	 * @return {[type]} [description]
	 */
	make: function( e ) {

		var that = this;
		var total = this.utils.cart.total();
		var order = this.utils.cart.order();
		var user = this.data.common.user;
		var manager = this.data.manager;
		var sn = this.utils.genOrderSN();

		wx.showToast({
		  title: '生成中',
		  icon: 'loading',
		  duration: 10000
		});

		var tab = app.xpm.require('Table', 'order');
		tab.create({
			sn:sn,
			uid:user['_id'],
			goods:this.utils.cart.get(),
			contact: order['contact'],
			mobile: order['mobile'],
			address: order['address'],
			status:'WAIT_PAY', // 等待支付
			remark:'代客下单'

		}).then( function( order ) {

			that.utils.cart.clean(); // 清空购物车
			wx.redirectTo({
				url:'/manager/order/detail/detail?id=' + order['_id'],
				complete:function(){ wx.hideToast();}
			});
		}).catch( function( excp ) {
			console.log( 'someting error', excp );
			wx.hideToast();
			wx.showModal({
			  title: '下单失败',
			  content: '下单失败失败了, 点击确定重试',
			  success: function(res) {
			    if (res.confirm) {
			      	that.make();
			    }
			  }
			})

		});

	},


	/**
	 * 返回重选商品按钮
	 * @return {[type]} [description]
	 */
	back: function( e ) {
		wx.navigateBack({});
	},


	/**
	 * 选择地址按钮
	 * @return {[type]} [description]
	 */
	chooselc: function(){
		
		var that = this;

		app.utils.chooseLocation().then(function( data ){
			that.utils.cart.order({'address':data['address']});
			that.setData({'order.address':data['address']}); // 更新地址信息
		})

		.catch( function( excp ) {
			console.log('some thing error:', excp );
		})

	},

	/**
	 * 增加商品按钮
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	incr: function(e) {
		var data = e.target.dataset, cart={}, newdata={};
		var id = data['id'] || null;
		if ( id == null ) return;

		var good = this.data.goods[id] || {} , amt = new Number(this.data.goods[id]['amount']);

		this.utils.cart.add(good['id'], good['sale_price'], 1 );
		cart = this.utils.cart.total();

		amt = amt + 1;
		newdata = {cart:cart};
		newdata["goods."+ id + ".amount"] = amt;

		this.setData(newdata);
	},


	/**
	 * 减少商品按钮
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	disc: function(e) {
		var data = e.target.dataset, cart={}, newdata={};
		var id = data['id'] || null;
		if ( id == null ) return;

		var good = this.data.goods[id] || {} , amt = new Number(this.data.goods[id]['amount']);

		this.utils.cart.rm(good['id'], 1);
		cart = this.utils.cart.total();
		newdata = {cart:cart};

		// 删除
		amt = amt - 1;
		if ( amt <  0 ) {
			amt = 0;
		}
		newdata["goods."+ id + ".amount"] = amt;

		this.setData(newdata);
	},

	
	onLoad: function () {

		console.log( 'onLoad');
		var that = this;

		if ( app.session.get('_asuser') == null ) {
			wx.navigateTo({ url: '/manager/order/user/user'});
			return;
		}
		
		// 读取用户资料
		var uinfo = app.session.get('_asuser');
		common.extend( this );
		common.title('帮助『' +  uinfo['name'] +  '』下单');
		common.userbar( uinfo );


		this.utils = new Goods( uinfo, app.session );

		// 读取当前用户购物车
		this.setData({cart:this.utils.cart.total(), order:this.utils.cart.order()});

		// 查询购物车中的商品信息
		var goods = this.utils.cart.get();
		var gids = [];
		for( var idx in goods ) {
			gids.push(idx);
		}

		this.goods = app.xpm.require('table', 'goods');
		this.goods.query()
			.where('_id','in', gids ) // 后端版本 1.0rc4以上  wherein support

		.fetch('*').then( function( data ) {

			data = that.utils.fliter( data );
			for (var idx in data){
				var id = data[idx]['_id'];
				goods[id] = app.utils.merge( goods[id], data[idx] );
			}

			that.setData({'goods':goods } );
		})

		.catch( function( excp ){
			console.log( 'error', excp, gids, that.data  );
		});

		this.isOnline();
	},

	utils: null,
	goods:null
})