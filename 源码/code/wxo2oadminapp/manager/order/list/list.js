var common = require('../../common/common.js');

//获取应用实例
var app = getApp();
var _P = app.xpm.getPromise();

Page({
	data: {
		'sys':{},
		'manager':{}, // 管理员身份信息
		'user':{},  // 用户身份信息
		'orders':[],   // 订单信息
		'goods':[],	   // 商品信息
		'cart': {total:0, sale_price:0, show_price:'0.00' }    // 购物车
	},

	// 转向订单详情页
	detail:function( e ) {
		
		var data = e.target.dataset;
		wx.navigateTo({
			url:'/manager/order/detail/detail?id=' + data['id'],
			complete:function(){}
		});
	},

	// 下拉刷新
	onPullDownRefresh: function( e ){
		
		var that = this;

		this.getOrders().then( function( data ) {
			that.setData( data );
			return;
		})

		.then(function() {
			wx.stopPullDownRefresh();
		});
		
	},


	/**
	 * 读取订单列表
	 * @param  {[type]} page [description]
	 * @return {[type]}      [description]
	 */
	getOrders: function( page ) {
		var that = this,goods = {}, orders = [];
		page = page || 1;
		return new _P( function( resolve, reject ) {

			if( that.order == null ) {
				that.order = app.xpm.require('table', 'order');	
			}

			if ( that.goods == null ){
				that.goods = app.xpm.require('table', 'goods');
			}



			that.order.query()
				.where('status','<>','CANCEL') // 忽略已取消订单
				.where('status','<>','DONE')  // 忽略已完成订单
				.inWhere('goods','goods')
				.paginate(10,  page)
				.orderby('created_at', 'desc')

			.fetch('*').then( function( resp ) {  // 读取订单信息

				var data = resp['data'];
				for( var i in data ) {
					for( var j in data[i]['goods'] ) {
						goods[j] =  data[i]['goods'][j];
					}
				}

				var gids = [];
				for( var idx in goods ) {
					gids.push(idx);
				}

				orders = resp;
				/*return that.goods.query().where('_id','in', gids ).fetch('*');


			}).then( function( data ) {   // 读取订单中的商品信息

				for (var idx in data){
					var id = data[idx]['_id'];
					goods[id] = app.utils.merge( goods[id], data[idx] );
				} */

				var status = {
					'WAIT_PAY':{name:'待付款', style:'text-warn'},
					'WAIT_CFM':{name:'待确认', style:'text-warn'},
					'PENDING':{name:'配送中', style:'text-muted'},
					'DOING':{name:'服务中', style:'text-muted'},
					'WAIT_RWD':{name:'待评价', style:'text-primary'},
					'DONE':{name:'完成', style:'text-muted'},
					'CANCEL':{name:'已取消', style:'text-muted'}	
				};

				// 处理订单渲染数据
				for( var i in orders['data'] ) {
					var o = orders['data'][i],  gid = null;
					for( var j in orders['data'][i]['goods'] ) { gid=j; break; };

					o['show_status'] = status[o.status];
					o['show_name'] = goods[gid]['name'];
					o['corver'] = goods[gid]['corver'];

					if ( typeof Object.keys == 'function' ) {
						if ( Object.keys(orders['data'][i]['goods']).length > 1 ) {
							o['show_name'] = o['show_name'] + '等';
						}
					}
				}

				resolve({'orders':orders['data'], 'goods':goods});
			})

			.catch( function( excp ){
				reject(excp);
			});

		})

	},

	onShow: function() {

		wx.showToast({
		  title: '读取中',
		  icon: 'loading',
		  duration: 10000
		});

		var that = this;

		// 拉取订单信息
		this.getOrders().then( function( data ){

			that.setData( data );
			return;
		})

		.then(function(){
			wx.hideToast();
		})

		.catch( function( excp ){
			console.log( 'error', excp );
		})

		
	},

	onLoad: function () {
			
		var that = this;
		
		common.extend( this );
		common.title('订单处理');
		
		this.setData({'sys':wx.getSystemInfoSync()});
		
		this.order = app.xpm.require('table', 'order');	
		this.goods = app.xpm.require('table', 'goods');

	},

	user:null,
	order: null,  // 订单表
	goods: null   // 商品表

})