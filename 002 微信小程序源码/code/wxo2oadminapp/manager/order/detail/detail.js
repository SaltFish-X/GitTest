var common = require('../../common/common.js');
var Goods = require("../../../utils/goods.js");
var Payment = require("../../../utils/payment.js");
var app = getApp();
var _P = app.xpm.getPromise();


//获取应用实例
Page({

	data: {
		'id': null,	  // 当前订单 id 
		'locked':false, // 状态锁定
		'online':{status:'离线', style:'text-muted', disabled:true},    // 用户是否在线
		'manager':{}, // 管理员身份信息
		'goods':[],   // 商品信息
		'order':{show_status:{tpl:'done'}},  // 订单信息
		'balance':{total:0.00},
		'user':{}  // 订单中用户信息
	},

	// 下拉刷新
	onPullDownRefresh: function( e ){

		var that = this;
		this.getOrder( this.id ).then( function( data ) {
			that.setData({
				'common.user':data.user,
				user:data.user,
				goods:data.goods,
				order:data.order
			});
			return;
		})

		.then(function() {
			that.isOnline();
			wx.stopPullDownRefresh();
		});
		
	},


	/**
	 * 更新订单状态
	 * @param  {[type]} id     [description]
	 * @param  {[type]} status [description]
	 * @return {[type]}        [description]
	 */
	updateStatus: function( id, status ) {

		this.id = id || null;
		var that = this;

		if ( typeof id == 'undefined' ) {
			return;
		}

		var data = {};
		if ( typeof status == 'string') {
			data = {status:status};
		} else if ( typeof status == 'object') {
			data = status;
		}

		this.setData({locked:true});
		that.order.update(id, data).then(function(order){
			that.onPullDownRefresh();
		}).catch(function( error ) {
			that.setData({locked:false});
			return;
		}).then(function() {
			that.setData({locked:false});
		});
	},


	/**
	 * 读取订单数据
	 * @param  {[type]} id [description]
	 * @return {[type]}    [description]
	 */
	getOrder: function( id ) {
		this.id = id || null;
		var that = this;
		var status = {
			'WAIT_PAY':{name:'待付款', style:'text-warn', tpl:'wait_pay'},
			'WAIT_CFM':{name:'待确认', style:'text-warn', tpl:'wait_cfm'},
			'PENDING':{name:'配送中', style:'text-muted', tpl:'pending'},
			'DOING':{name:'服务中', style:'text-muted', tpl:'doing'},
			'WAIT_RWD':{name:'待评价', style:'text-primary', tpl:'wait_rwd'},
			'DONE':{name:'完成', style:'text-muted', tpl:'done'},
			'CANCEL':{name:'已取消', style:'text-muted', tpl:'done'}
		};


		return new _P( function( resolve, reject ) {
			if ( typeof id == 'undefined' ) {
				reject({code:404, message:'订单不存在', extra:{id:id}});
				return;
			}

			var order = {}, goods =[], user={};

			that.order.query()
				.where('_id', '=', id )
				.inWhere('goods', 'goods')
				.limit(1)
				.fetch()

			.then(function( resp ) {

				var order_data = resp[0];

				if ( app.utils.empty(order_data) ) {
					reject({'code':404, 'message':'订单不存在', 'extra':{id:id} });
					return;
				}

				var gids = [], order_price = 0;
				goods = order_data['goods'];
				
				for( var idx in goods ) {
					gids.push(idx);

					order_data['show_status'] = status[order_data.status];

					// 下单时的价格
					order_data['goods'][idx]['amount'] = order_data['goods'][idx]['amount'] || 1;
					var price=order_data['goods'][idx]['price'];
					var amount=order_data['goods'][idx]['amount'];
						order_price = order_price + ( new Number(price) * new Number(amount) );
						order_data['goods'][idx]['sale_price'] = price;
						order_data['goods'][idx]['show_price'] = (price/100).toFixed(2).toString();
						delete order_data['goods'][idx]['price'];
				}

				order_data['sale_price'] = order_price;
				order_data['show_price'] = (order_price/100).toFixed(2).toString();

				order = order_data;

				/*return that.goods.query().where('_id','in', gids ).fetch('*');
			})

			.then ( function( data ) { */

				var i = 0, data = order_data['goods'];
				for (var idx in data){
					var id = data[idx]['_id'];
					goods[id] = app.utils.merge(  data[idx],goods[id] );

					// 更新订单名称等信息
					if (i==0) {
						
						order['show_name'] = goods[id]['name'];
						order['corver'] = goods[id]['corver'];
						if ( typeof Object.keys == 'function' ) {
							if ( Object.keys(data).length > 1 ) {
								order['show_name'] = order['show_name'] + '等';
							}
						}
					}

					i++;
				}

				return that.user.tab.get(order['uid']);

			})

			.then ( function( userResp ) {
				resolve({goods:goods, order:order, user:userResp});
			})
			.catch( function( excp ) {
				reject(excp);
			});
		});

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

	onShow: function(){
		var that = this;
		that.data.common = that.data.common || {};
		
		if ( typeof that.data.common.user == 'object') {
			that.isOnline();
		}
	},

	onHide: function(){
		app.wss.close();
	},


	onLoad: function( _get ) {
		
		var that = this;
		common.extend( this );
	
		this.order = app.xpm.require('table', 'order');	
		this.goods = app.xpm.require('table', 'goods');
		this.user =  app.xpm.require('user');

		this.getOrder( _get['id'] ).then( function( data ) {

			common.title('订单:' + data.order['sn']);
			common.userbar( data.user );
			
			that.setData({
				user:data.user,
				goods:data.goods,
				order:data.order
			});


			that.isOnline();


			// 读取账户余额
			that.payment = new Payment( data.user['_id'], app.session );
			that.payment.balance().then(function( balance ){
				// console.log( balance );
				var total = new Number(balance.total)/100 ;
				that.setData({'balance.total': total.toFixed(2) });
			});

		})

		.catch( function(excp) {
			console.log('出错了', excp );
		})


		// 监听 Socket 
		app.wss.bind('close', function(event) {
			that.setData({'common.user.online':'off'});
		    that.setData({'online':{status:'离线', style:'text-muted', disabled:true}});
		});

		// 处理请求付款结果 ( 店员测 )
		app.wss.listen('payment.answer', function( res, status ) {

			if ( status != 'success') return ;
			
			var params = res.request.b;
			var oid = params['id']  || null;
			var payment = params['payment']  || {};

			if ( params['code'] !=  0 ) {

				that.setData({'common.user.message':{
					status:'用户未完成付款', 
					style:'text-warn', 
					disabled:false
				}});

				setTimeout(function(){
					that.isOnline();
				}, 3000);

			} else {

				that.onPullDownRefresh();//刷新当前页
			}
		});


		// 处理请求付款结果 ( 店员测 )
		app.wss.listen('reward.answer', function( res, status ) {

			if ( status != 'success') return ;
			
			var params = res.request.b;
			var oid = params['id']  || null;
			var payment = params['payment']  || {};

			if ( params['code'] !=  0 ) {

				that.setData({'common.user.message':{
					status:'用户未完成评价', 
					style:'text-warn', 
					disabled:false
				}});

				setTimeout(function(){
					that.isOnline();
				}, 3000);

			} else {

				that.onPullDownRefresh();//刷新当前页
				// that.isOnline(); // 恢复响应状态
			}
		});



		// 客户侧 模拟评价打赏完成后发送消息 (仅调试用 Debug Only )
		// app.wss.listen('reward', function( res, status ){
		//     // 当接收到 payment 指令后运行 
		//     if ( status != 'success') return ;

		//     var params = res.request.b;
		//     var manager = res.response;
		// 	var mid = manager['_id'] || null , oid = params['id']  || null;
			
		// 	if (  mid == null ) {return; } 
		// 	if ( oid == null ){
		// 		app.wss.send('reward.answer', {code:502, message:'bad request'}, mid );
		// 		return;
		// 	}

		// 	that.order.update(oid, {status:'DONE'}).then(function(order) { 
		// 		setTimeout(function(){
		// 			app.wss.send('reward.answer', {code:0, reward:5, money:500}, mid );
		// 		}, 1000);
		// 	});

		// });



		// 客户测 模拟付款成功后发送消息 (仅调试用 Debug Only )
		// app.wss.listen('payment', function( res, status ){
		//     // 当接收到 payment 指令后运行 
		//     if ( status != 'success') return ;

		//     var params = res.request.b;
		//     var manager = res.response;
		// 	var mid = manager['_id'] || null , oid = params['id']  || null;
			
		// 	if (  mid == null ) {return; } 
		// 	if ( oid == null ){
		// 		app.wss.send('payment.answer', {code:502, message:'bad request'}, mid );
		// 		return;
		// 	}

		// 	var pay =  app.xpm.require('pay');
		// 	that.getOrder(oid).then(function( data ) {

		// 		return pay

		// 		.before('create', {  // 创建充值记录
		// 			'table':'income',
		// 			'data': {
		// 				sn:'{{sn}}',
		// 				order_sn: data.order.sn,
		// 				uid:data.order.uid,
		// 				amount:data.order.sale_price,
		// 				amount_free:0,
		// 				status:'PENDING',
		// 				status_tips:"F请求付款"
		// 			}
		// 		})

		// 		.order({   // 生成订单
		// 		    total_fee:data.order.sale_price,  // 单位分
		// 		    body:data.order.show_name,
		// 		    attach:'attach user is ' + mid,  // 应该是当前登录用户的 ID 
		// 		    detail:data
		// 		})

		// 		.success('update', {    // 更新充值记录
		// 			'table':'income',
		// 			'data': {
		// 				sn:'{{sn}}',
		// 				status:'DONE',
		// 				status_tips:"income status_tips field"
		// 			},
		// 			'unique':'sn'
		// 		})

		// 		.success('app', {   // 调用APP 示例
		// 			'name':'xapp',
		// 			'api':['ticket','index',{sn:'{{sn}}','status_tips':"{{sn}} {{0.status}}  {{0.status_tips}}"}],
		// 			'data': {
		// 				sn:'{{sn}}',
		// 				status_tips:'{{0.status_tips}} {{0.sn}}',
		// 				status:'DONE'
		// 			}
		// 		})

		// 		.success('update', {  // 更新订单状态
		// 			'table':'order',
		// 			'data': {
		// 				_id:oid,
		// 				status:'PENDING'
		// 			}
		// 		})

		// 		.success('create', {   // 创建消费记录
		// 			'table':'payout',
		// 			'data': {
		// 				sn:'{{sn}}',
		// 				order_sn: data.order.sn,
		// 				uid:data.order.uid,
		// 				amount:data.order.sale_price,
		// 				amount_free:0,
		// 				status:'DONE',
		// 				status_tips:"F请求付款"
		// 			}
		// 		})

		// 		.request(); // 发起请求


		// 	}).then(function( payResp  ) {
				
		// 		console.log( payResp );
		// 		app.wss.send('payment.answer', {code:0, payment:payResp, id:oid}, mid );

		// 	}).catch(function( excp) {
		// 		app.wss.send('payment.answer', {code:500,excp:excp}, mid );
		// 	});		    
		// });

	},


	// === 订单相关功能实现 ============
	// 
	// 取消订单
	cancel: function(){
		var that = this;

		wx.showModal({
		  title: '确认取消?',
		  content: '请确认取消订单',
		  success: function(res) {
		    if (res.confirm) {
		    	that.updateStatus(that.id, 'CANCEL');
		    }
		  }
		})
	},

	// 现金结算
	money: function(){
		var that = this;

		wx.showModal({
		  title: '确认已收款?',
		  content: '请确认已收到付款 '+ that.data.order.show_price + ' 元',
		  success: function(res) {
		    if (res.confirm) {

		    	console.log( that.data.order.sn );

		    	wx.showToast({
				  title: '付款中',
				  icon: 'loading',
				  duration: 10000
				});

		    	that.payment.cashThenPayout({
					amount:that.data.order.sale_price,
					amount_free:0,
					option:{body:'线下付款'}
				},{
					amount:that.data.order.sale_price,
					amount_free:0,
					option:{
						order_sn:that.data.order.sn,
						order_status:'PENDING'
					}
				})
				.then( function( balance ){

					wx.showToast({
					  title: '完成',
					  icon: 'success',
					  duration: 1000
					});

					setTimeout(function(){
						that.onPullDownRefresh();
					},1000)
				})
				
				.catch( function(excp){
					wx.hideToast();
					wx.showModal({
					  title: '付款失败!',
					  content: '支付失败了, 请联系客服'
					})
				});
		    	
		    }
		  }
		})
	},


	// 余额结算
	pay: function(){


		if ( that.data.order.sale_price < that.data.balance.total ) {
			console.log( that.data.order.sale_price );

			wx.showModal({
			  title: '用户帐号余额不足',
			  content: '请更换其他支付方式'
			})
			return;
		}


		var that = this;
		wx.showModal({
		  title: '确认扣减用户余额?',
		  content: '请确认扣减用户余额',
		  success: function(res) {
		    if (res.confirm) {
		    	console.log( 'ok');
		    	// that.updateStatus(that.id, 'CANCEL');
		    }
		  }
		})
	},

	// 向客户发送付款请求
	payrequest:function() {
		var that = this;
		app.wss.send('payment', {id:this.id}, that.data.common.user['_id'] )
		   .then(function( resp ){
		   		that.setData({'common.user.message':{
		   			text:'付款请求已发送', 
		   			style:'text-primary', 
		   		disabled:true}} );
		   })
		   .catch(function(excp) {
		   		console.log('付款请求发送失败', excp);
		   });
	},


	// 向客户发送评分请求
	rwdrequest: function(){
		var that = this;
		app.wss.send('reward', {id:this.id}, that.data.common.user['_id'] )
		.then(function( resp ){
			that.setData({'common.user.message':{
					text:'评分请求已发送', 
					style:'text-primary', 
				disabled:true}} );
		})
		.catch(function(excp) {
				console.log('评分请求发送失败', excp);
		});
	},


	confirm:function(){
		this.updateStatus(this.id, 'PENDING');
	},

	reward: function() {
		this.updateStatus(this.id, 'WAIT_RWD');
	},

	golist: function() {
		wx.switchTab({url:'/manager/order/list/list'});
	},

	call: function( e ) {
		var data = e.target.dataset;
		wx.makePhoneCall({phoneNumber: data['mobile']});
	},

	goods:null,
	order:null,
	payment:null,
	user:null
})