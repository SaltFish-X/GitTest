var Goods = require("../../../utils/goods.js");
var app = getApp();
var _P = app.xpm.getPromise();
Page({

	data:{
		system:{},
		paginate:{},
		goods:[],
		cart:{},
		goodsLoading:'',
		lock: false
	},

	// 链接到详情页
	detail:function(e){
		var data = e.target.dataset;
		wx.navigateTo({ url: '/pages/store/products/detail?_id=' + data.id });
	},

	loading: function() {
		this.lock = true;
		this.setData( {goodsLoading:''} );
	},

	done: function() {
		this.lock = false;
		this.setData( {goodsLoading:'hidden'} );
	},

	next: function( e ) {
		var that = this;
		if ( this.lock ) return;
		if ( this.data.paginate.next == this.data.paginate.curr ) return;

		this.loading();
		this.getGoods( this.data.paginate.next ).then( function(resp ) {
			var goods = that.data.goods;
			for( var i in resp.goods ) {
				goods.push(resp.goods[i]);
			}
			that.setData( {paginate: resp.paginate, goods:goods} );
	    	that.done();
		});
	},

	// 购物车结算
	payout: function(e) {
		wx.navigateTo({ url: '/pages/store/order/confirm/confirm' });
	},
	
	// 清空购物车	
	cleanup: function(e) {
		this.storeUtils.cart.clean();
		this.setData({cart: this.storeUtils.cart.total()});
	},

	// 添加到购物车
	addtocart: function( e ) {
		var data = e.target.dataset;
		this.storeUtils.cart.add(data['id'], data['price'], data['amount']);
		this.setData({cart: this.storeUtils.cart.total()});
	},

	// 读取商品信息
	getGoods: function ( page ) {

		var that = this;
			page = page || 1;

		return new _P( function( resolve, reject ) {

			that.goods.query()
				.where('status', '=', 'online')
				.paginate( 10, page )

			.fetch('*').then(function(resp) { 

				resp.next_page = resp.current_page + 1;
				if ( resp.next_page > resp.last_page ) {
					resp.next_page = resp.last_page;
				}

				resolve({
					paginate:{
						curr:resp.current_page,
						next:resp.next_page,
						last:resp.last_page,
						total:resp.total
					},
					goods:that.storeUtils.fliter(resp.data)
				});

			}).catch(function( excp ){
				reject(excp);
			})

		});
	},

	onLoad:function( params ) {

		var that = this;
	    this.goods = app.xpm.require('Table','goods');

	    // 设置页面高度
	    this.setData({'system':wx.getSystemInfoSync()});

	    // 用户登录
	    app.user.login().then( function( userInfo ) {
	        that.storeUtils = new Goods( userInfo, app.session );
    		that.setData({cart:that.storeUtils.cart.total()});  // 初始化购物车信息
	        
	        return that.getGoods();  // 读取商品列表

	    }).then( function( resp ) {
	    	that.setData( resp );
	    	that.done();
	    });
	},

	goods:null,  // 商品表
	storeUtils:null, // 商店工具对象 ( 购物车、商品价格计算等 )

});