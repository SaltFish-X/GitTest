var pay   = require("../../../../utils/pay.js");
var payment   = require("../../../../utils/payment.js");
var Goods = require("../../../../utils/goods.js");
var app = getApp();
var _P = app.xpm.getPromise();

//获取应用实例
Page({
	data: {
	  type:'cardpay'
	},
	// 返回操作
	goback:function(){
		wx.navigateTo({ url:'/pages/store/order/myorder/myorder'});
	},
	// 支付方式选择
	come:function(e){
		var that   = this;
		var val = e.target.dataset.value;
		that.setData({type:val});
	},
  	/**
	 * 读取订单数据
	 * @param  {[type]} id [description]
	 * @return {[type]}    [description]
	 */
getOrder:function( id ) {
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
			that.order = app.xpm.require('table', 'order'); 
			that.user = app.xpm.require('user','user'); 
			that.order.query()
				.where('_id', '=', id )
				.inWhere('goods', 'goods')
				.limit(1)
				.fetch('*')
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
			}).then ( function( userResp ) {
				resolve({goods:goods, order:order, user:userResp});
			})
			.catch( function( excp ) {
				reject(excp);
			})
		});
	},
linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    console.log(link);
    if ( link != '/pages/404/404') {
      wx.navigateBack({ url: link });
    }
  },

// 余额支付
ePay:function(){
		var that  = this;
	 	// 价格当前
	  	var show_price = that.data.order.show_price;
	  	// 当前订单号
	  	var sn = that.data.order.sn;
	  	// 当前的_id
	  	var _id = that.data.order._id;
	  	// 对价格进行处理
	  	that.payment.balance().then(function(data){
			  	var res =  {cartdata:{
		  			amount_free:data.amount_free,
		  			amount:data.amount
			  		},
			  		amount:show_price
			  	}
		  		return that.pay.paychange(res);
		}).then(function(data){
			if (data=='defeated'){
				wx.showModal({
		          	title: '警告',
		          	content: '余额不足,请及时充值'
		        })
				return;
			};
			// 提供不同的支付方式
			var resdata = 'card_'+data;
			var autdata = {
				orderid:sn,
				amount:show_price*100
			}
			if (resdata=='card_amount_free'){
				var equality =that.pay.card_amount_free(autdata);
			}else{
				var equality =that.pay.card_amount(autdata);
			};
			equality.then(function(data){
				if (data!=null){
					wx.redirectTo({
				        url:'/pages/store/order/detail/detail?id=' + _id
				    });
				};
			})
		}).catch(function(data){
			console.log(data);
		})
},	
// 微信支付
wxPay:function(){
	var that  = this;
	 // 价格当前
  	var show_price = that.data.order.show_price*100;
  	// 当前订单号
  	var sn = that.data.order.sn;
  	// 当前的_id
  	var _id = that.data.order._id;
	var data = {
		total:show_price,
		sn:sn,
		_id:_id
	}
	that.pay.wxpay(data);
},
comment:function(){
	var that  = this;
	// 当前的_id
  	var _id = that.data.order._id;
	wx.navigateTo({url:'/pages/store/order/star/star?id='+_id});
},
// 付款
payat:function(e){
  	var that  = this;
  	var type  = that.data.type;
	// 选择支付方式
  	if(type=='cardpay'){
  		that.ePay();
  	}else{
  		that.wxPay()
  	};
	app.wss.send('payment.answer', {code:0, message:'success'}, this.mid );
},
onLoad:function(e){
	var that   = this;
	var user = app.xpm.require('User');
	user.login().then(function( userInfo ){
		that.payment =  new payment(userInfo._id,app.session);
		that.utils   =  new Goods(userInfo,app.session);
		that.pay     =  new pay(that.payment,that.utils);
		that.payment.balance().then(function(data){
			that.setData({amount:data.total});
		}).catch(function(data){
			console.log(data);
		})
	}).catch(function(data){
		console.log(data);
	})
	var order = app.xpm.require('Table','order');
	var  id = e.id;
	if (id==""||id==null||id==undefined) {
			wx.showModal({
	          title: '警告',
	          content: '获取id错误',
	          showCancel:false
	        })
	        return
		};
		// 可用余额
		that.getOrder(id).then(function(data){
			// console.log(that.payment.balance());
			that.setData({goods:data.goods});
			that.setData({order:data.order});
			that.setData({user:data.user});
			// 循环星星
			var star = data.order.star;
			var arr  = new Array();
			for (var i = 0; i < star; i++) {	
				var obj = {};
		        obj['link'] ='/res/icons/rstart.png';
		        arr[i] = obj
			};
			that.setData({start:arr});
		}).catch(function(data){
			console.log(data);
		})
	}
})