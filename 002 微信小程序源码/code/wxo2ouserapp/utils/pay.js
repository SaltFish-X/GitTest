var app = getApp();
var _P = app.xpm.getPromise();
function pay(car,untils) { 
	var that = this;
	var app = getApp();
	// 生成随机数
	this.randomnum = function() {
	    var timestamp = (new Date()).valueOf();
	    return timestamp.toString() + Math.ceil(Math.random()*1000).toString();
	},
	// 判断缓存中是否存在userid
	this.userdata = function(e){
		var stor = app.xpm.require('Stor');
		var userdata = stor.getSync('userdata');
		var user = app.xpm.require('User');
		var userdata = app.xpm.require('Table','user');
		return  new _P(function (resolve, reject){
			if(user==''||user==null){
					resolve(data);
			}else{
				user.login().then(function( userInfo ){ 
					return userInfo._id;
				}).then(function(id){
					userdata.query()
					.where('_id', '=', id)
					.fetch('*').then(function(data) {  
					    resolve(data); 
					})
				}).catch(function(excp){
					console.log('Request Pay Failure', excp );
				})
			};
		})
	},
	/**
	 * 判断支付方式
	 * 当前价格
	 * 购物车价格
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	this.paychange = function(e){
		if (e.cartdata.amount_free>=e.amount){
			return 'amount_free'
		}else if(e.cartdata.amount>=e.amount){
			return 'amount'
		}else{
			return 'defeated'
		};
	},
	/**
	 * 余额支付，赠送余额
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	this.card_amount_free =function(e){
		return  new _P(function (resolve, reject){
		   car.payout(0,e.amount,{
                   order_sn:e.orderid,
                   order_status:'PENDING'
                    }).then(function(data){
                      resolve(data);
            }).catch( function(excp){
                      reject(excp);
            })
		}) 
	},
	/**
	 * 余额支付，充值余额
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	this.card_amount =function(e){
		return  new _P(function (resolve, reject){
		   car.payout(e.amount,0,{
                   order_sn:e.orderid,
                   order_status:'PENDING'
                    }).then(function(data){
                      resolve(data);
            }).catch( function(excp){
                      reject(excp);
            })
		})  
	},
	// 微信支付
	this.wxpay = function(e){
		car.incomeThenPayout({
			amount:e.total,
			amount_free:0,
			option:{body:'微信充值'}
		},{
			amount:e.total,
			amount_free:0,
			option:{
				order_sn:e.sn,
				order_status:'PENDING'
			}
		}).then( function( balance ){
				var _id = e._id
				untils.cart.clean();
				wx.redirectTo({url:'/pages/store/order/detail/detail?id='+_id})
				console.log( 'cash balance',  balance );
		}).catch( function(excp){
				console.log( 'cash Excp Error', excp  );
		});
	}
}
module.exports = pay;