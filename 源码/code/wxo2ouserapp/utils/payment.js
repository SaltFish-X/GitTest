var app = getApp();
var _P = app.xpm.getPromise();


function Payment( uid, session ) {

	this.tabs = {
		'income': app.xpm.require('Table', 'income'),
		'payout': app.xpm.require('Table', 'payout')
	}

	this.que = app.xpm.require('Que');
	this.pay = app.xpm.require('Pay');

	this.uid = uid;
	this.ss = session || app.xpm.session;
	this.sname =  '_balance_' + uid;
	

	// 微信充值
	this.income = function( amount, amount_free, option  ) {
		
		var that = this;
			option = option || {};
			option.body = option.body || '商城充值';
			option.detail = option.detail  || {};
			amount = new Number(amount);
			amount_free = new Number(amount_free) || 0;

		return new _P( function (resolve, reject ) {

			if ( amount < 0 || amount_free < 0 ) { reject({code:403, message:'充值金额有误'}); return; }
			if ( amount == 0 &&  amount_free==0 ) { reject({code:403, message:'充值金额有误'}); return; }

			return that.pay

				.before('create',{
					'table':'income',
					'data': {
						sn:'{{sn}}',
						order_sn: option.order_sn,
						uid:that.uid,
						amount:amount,
						amount_free:amount_free,
						status:'PENDING',
						status_tips:"微信支付充值 out_trade_no:{{out_trade_no}}"
					} 
				})
				.order({   // 生成订单
				    total_fee:amount,  // 单位分
				    body:option.body,
				    attach:that.uid,  // 应该是当前登录用户的 ID 
				    detail:option.detail 
				})
				.success('update', {    // 更新充值记录
					'table':'income',
					'data': {
						sn:'{{sn}}',
						status:'DONE'				
					},
					'unique':'sn'
				
				}).request()

				.then( function( payResp ) {   // 更新余额
					return that.balance( true);
				})
				.then( function( balance ) { 
					resolve(balance);
				})

				.catch( function( excp ){
					reject(excp);
				});

		});
	}


	// 现金充值
	this.cash = function( amount, amount_free, option ) {
		var that = this;
			option = option || {};
			option.detail = option.detail  || {};
			amount = new Number(amount);
			amount_free = new Number(amount_free) || 0;

		return new _P( function (resolve, reject ) {

			if ( amount < 0 || amount_free < 0 ) { reject({code:403, message:'充值金额有误'}); return; }
			if ( amount == 0 &&  amount_free==0 ) { reject({code:403, message:'充值金额有误'}); return; }

			return that.que.select('income')

				.push('create', {
					'table':'income',
					'data': {
						sn:that.genSN(),
						order_sn: option.order_sn,
						uid:that.uid,
						amount:amount,
						amount_free:amount_free,
						status:'DONE',
						status_tips:"现金或线下充值"
					}
				}).run()

				.then( function( payResp ) {   // 更新余额
					return that.balance(true);
				})
				.then( function( balance ) { 
					resolve(balance);
				})
				.catch( function( excp ){
					reject(excp);
				});

		});	
	}


	// 付款
	this.payout = function( amount, amount_free, option ) {
		
		var that = this;
		option = option || {};
		option.order_sn = option.order_sn || 0;
		option.order_status = option.order_status || "";
		option.status_tips = option.status_tips || '';
		amount_free = new Number(amount_free) || 0;
		amount = new Number(amount) || 0;

		return new _P( function ( resolve, reject ) {

			if ( amount < 0 ||  amount_free < 0 ) {
		 		reject({code:403, message:'扣减金额异常',extra:{amount:amount, amount_free:amount_free, option:option} })
		 		return;
		 	}

		 	if ( amount == 0 && amount_free == 0 ) {
		 		reject({code:403, message:'扣减金额异常',extra:{amount:amount, amount_free:amount_free, option:option} })
		 		return;
		 	}


		 	_P.all([
		 		that.isEnough(amount,'amount'),
		 		that.isEnough(amount_free,'amount_free'),
		 	])

		 	.then(function( values ) {
		 		
		 		if ( values[0] !== true || values[1] !== true ){
		 			reject({code:403, message:'账户余额不足',extra:{amount:amount, amount_free:amount_free, option:option} })
		 			return;
		 		}

		 		if ( option.order_sn != 0  && option.order_status != "" ) {

		 			return that.que.select('payout')
			 			.push('create',{
							'table':'payout',
							'data': {
						 		sn:that.genSN(),
								order_sn: option.order_sn,
								uid:that.uid,
								amount:amount,
								amount_free:amount_free,
								status:'DONE',
								status_tips:option.status_tips
						 	} 
						})
						.push('update', {  // 更新订单状态
							'table':'order',
							'data': {
								sn:option.order_sn,
								status:option.order_status,
								status_tips:'消费单号:{{0.sn}}'
							},
							'unique':'sn'
						}).run();

			 		
		 		} else {

			 		return that.payout.create({
				 		sn:that.genSN(),
						order_sn: option.order_sn,
						uid:that.uid,
						amount:amount,
						amount_free:amount_free,
						status:'DONE',
						status_tips:option.status_tips
				 	});
			 	}

			})

		 	.then(function( payOutResp ) {

				return that.balance( true);
			})
			.then( function( balance ) { 
				resolve(balance);
			})

			.catch( function( excp ){
				reject(excp);
			});
		});

	}


	/**
	 * 线上
	 * @param  {[type]} income [description]
	 * @param  {[type]} payout [description]
	 * @return {[type]}        [description]
	 */
	this.incomeThenPayout = function( income, payout ) {
		
		var that = this;
			income = income ||{}; payout = payout || {};
			income.option = income.option || {};
			income.option.body = income.option.body || '商城充值';
			income.option.detail = income.option.detail  || {};
			income.amount = new Number(income.amount);
			income.amount_free = new Number(income.amount_free) || 0;

			payout.option = payout.option || {};
			payout.option.order_sn = payout.option.order_sn || 0;
			payout.option.order_status = payout.option.order_status || "";
			payout.option.status_tips = payout.option.status_tips || '';
			payout.amount_free = new Number(payout.amount_free) || 0;
			payout.amount = new Number(payout.amount) || 0;


		return new _P( function (resolve, reject ) {

			if ( income.amount < 0 || income.amount_free < 0 ) { reject({code:403, message:'充值金额有误'}); return; }
			if ( income.amount == 0 &&  income.amount_free==0 ) { reject({code:403, message:'充值金额有误'}); return; }


			if ( payout.amount < 0 ||  payout.amount_free < 0 ) {
		 		reject({code:403, message:'扣减金额异常',extra:{income:income, payout:payout} })
		 		return;
		 	}

		 	if ( payout.amount == 0 && payout.amount_free == 0 ) {
		 		reject({code:403, message:'扣减金额异常',extra:{income:income, payout:payout} })
		 		return;
		 	}


			return that.pay

				.before('create',{
					'table':'income',
					'data': {
						sn:'{{sn}}',
						order_sn: payout.option.order_sn,
						uid:that.uid,
						amount:income.amount,
						amount_free:income.amount_free,
						status:'PENDING',
						status_tips:"微信支付充值 out_trade_no:{{out_trade_no}}"
					} 
				})
				.order({   // 生成订单
				    total_fee:income.amount,  // 单位分
				    body:income.option.body,
				    attach:that.uid,  // 应该是当前登录用户的 ID 
				    detail:income.option.detail 
				})
				.success('update', {    // 更新充值记录
					'table':'income',
					'data': {
						sn:'{{sn}}',
						status:'DONE'				
					},
					'unique':'sn'
				})

				.success('create',{    // 创建消费记录
					'table':'payout',
					'data': {
				 		sn:"{{sn}}",
						order_sn: payout.option.order_sn,
						uid:that.uid,
						amount: payout.amount,
						amount_free: payout.amount_free,
						status:'DONE',
						status_tips:payout.option.status_tips
				 	} 
				})
				.success('update', {  // 更新订单状态
					'table':'order',
					'data': {
						sn:payout.option.order_sn,
						status:payout.option.order_status,
						status_tips:'消费单号:{{1.sn}}'
					},
					'unique':'sn'
				}) 

				.request()  // 请求支付

				.then( function( payResp ) {   // 消费
					return that.balance( true);
				})
				.then( function( balance ) { 
					resolve(balance);
				})

				.catch( function( excp ){
					reject(excp);
				});
		});
	}


	/**
	 * 付款接口
	 * @param  {[type]} income [description]
	 * @param  {[type]} payout [description]
	 * @return {[type]}        [description]
	 */
	this.cashThenPayout = function( income, payout ) {
		var that = this;
			income = income ||{}; payout = payout || {};
			income.option = income.option || {};
			income.option.body = income.option.body || '商城充值';
			income.option.detail = income.option.detail  || {};
			income.amount = new Number(income.amount);
			income.amount_free = new Number(income.amount_free) || 0;

			payout.option = payout.option || {};
			payout.option.order_sn = payout.option.order_sn || 0;
			payout.option.order_status = payout.option.order_status || "";
			payout.option.status_tips = payout.option.status_tips || '';
			payout.amount_free = new Number(payout.amount_free) || 0;
			payout.amount = new Number(payout.amount) || 0;


		return new _P( function (resolve, reject ) {

			if ( income.amount < 0 || income.amount_free < 0 ) { reject({code:403, message:'充值金额有误'}); return; }
			if ( income.amount == 0 &&  income.amount_free==0 ) { reject({code:403, message:'充值金额有误'}); return; }


			if ( payout.amount < 0 ||  payout.amount_free < 0 ) {
		 		reject({code:403, message:'扣减金额异常',extra:{income:income, payout:payout} })
		 		return;
		 	}

		 	if ( payout.amount == 0 && payout.amount_free == 0 ) {
		 		reject({code:403, message:'扣减金额异常',extra:{income:income, payout:payout} })
		 		return;
		 	}
			
			return that.que.select('cashThenPayout')
				.push('create',{
					'table':'income',
					'data': {
						sn:that.genSN(),
						order_sn: payout.option.order_sn,
						uid:that.uid,
						amount:income.amount,
						amount_free:income.amount_free,
						status:'DONE',
						status_tips:"现金或线下充值"
					} 
				})

				.push('create',{    // 创建消费记录
					'table':'payout',
					'data': {
				 		sn:that.genSN(),
						order_sn: payout.option.order_sn,
						uid:that.uid,
						amount: payout.amount,
						amount_free: payout.amount_free,
						status:'DONE',
						status_tips:payout.option.status_tips
				 	} 
				})
				.push('update', {  // 更新订单状态
					'table':'order',
					'data': {
						sn:payout.option.order_sn,
						status:payout.option.order_status,
						status_tips:'消费单号:{{1.sn}}'
					},
					'unique':'sn'
				}) 

				.run()  // 请求支付

				.then( function( payResp ) {   // 消费
					return that.balance( true);
				})
				.then( function( balance ) { 
					resolve(balance);
				})

				.catch( function( excp ){
					reject(excp);
				});
		});
	}


	this.isEnoughSync = function( amount, type ){

		var balance = this.balanceSync();
		type = type || 'total';

		if ( typeof balance == 'object') {

			return  balance[type] >= new Number(amount);
		}

		throw new Error('balance is not init' );
	}

	this.isEnough = function( amount,  type, nocache ) {

		var that = this;
		nocache = nocache || false;
		type = type || 'total';

		return new _P( function (resolve, reject ) {
			that.balance( nocache ).then( function( balance){
				resolve ( balance[type] >= new Number(amount) );
			}).catch(function( excp ){
				reject(excp);
			})
		});

	}

	/**
	 * 读取帐号余额，同步接口 (仅从 Cache 中获取)
	 * @return {[type]} [description]
	 */
	this.balanceSync = function() {

		var balance = this.ss.get(this.sname);
		if ( typeof balance == 'object') {
			return balance;
		}

		throw new Error('balance is not init' );
	}

	/**
	 * 读取帐号余额
	 * @param  {Boolean} nocache [description]
	 * @return Promise
	 */
	this.balance = function( nocache = false ) {
		var that = this;
		
		return new _P( function (resolve, reject ) {

			if ( !nocache) {
				var balance = that.ss.get(that.sname);
				if ( typeof balance == 'object') {
					resolve( balance );
					return;
				}
			}

			var query = [
				that.tabs.income.getLine('WHERE uid = ? and status="DONE" ', [that.uid],  ['sum(amount) as amount', 'sum(amount_free) as amount_free']),
				that.tabs.payout.getLine('WHERE uid = ? and status="DONE" ', [that.uid],  ['sum(amount) as amount', 'sum(amount_free) as amount_free'])
			];

			_P.all(query).then( function(values) { 
				var income = values[0], payout = values[1], balance={amount:0, amount_free:0, total:0};
				balance['amount'] = new Number(income['amount']) - new Number(payout['amount']);
				balance['amount_free'] = new Number(income['amount_free']) - new Number(payout['amount_free']);
				balance['total'] =  balance['amount'] +  balance['amount_free'];
				that.ss.set(that.sname, balance);
				resolve( balance );
			})
			.catch( function(excp) {
				reject( excp);
			});
		});

	}

	// 生成单号
	this.genSN =  function() {
		var timestamp = (new Date()).valueOf();
		return timestamp.toString() + Math.ceil(Math.random()*1000).toString();
	}

}

module.exports = Payment;