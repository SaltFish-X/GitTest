//获取应用实例

var Payment = require('../../utils/payment.js');



var app = getApp();
Page({

	data:{
	  test:['que', 'joingrouphaving', 'selectin', 'payment'] 
	},

	trypayment: function(){
		var pay = new Payment(1, app.session );

		pay.isEnough(10).then(function( isEnough  ){

			console.log( isEnough );

		}) 

		.catch(function(excp){
			console.log( 'xxx', excp);
		})


		// 现金充付
		pay.cashThenPayout({
			amount:1000,
			amount_free:1000,
			option:{body:'充100送50线下'}
		},{
			amount:100,
			amount_free:500,
			option:{
				order_sn:'1484573213896171',
				order_status:'DOING'
			}
		})

		.then( function( balance ){
				console.log( 'cash balance',  balance );
		})
		
		.catch( function(excp){
				console.log( 'cash Excp Error', excp  );
		});


		// 微信支付
		// pay.incomeThenPayout({
		// 	amount:1,
		// 	amount_free:1,
		// 	option:{body:'充100送50线上'}
		// },{
		// 	amount:100,
		// 	amount_free:500,
		// 	option:{
		// 		order_sn:'1484573213896171',
		// 		order_status:'DOING'
		// 	}
		// })

		// .then( function( balance ){
		// 		console.log( 'cash balance',  balance );
		// })

		// .catch( function(excp){
		// 		console.log( 'cash Excp Error', excp  );
		// });


		// 现金充值
		// pay.cash(10000, 5000, {body:'充100送50线下'} )
		//    .then( function( balance ){
		//    		console.log( 'cash balance',  balance );
		//    })
		//    .catch( function(excp){
		//    		console.log( 'cash Excp Error', excp  );
		//    });

		// 微信充值   
		// pay.income(1, 5000, {body:'充100送50'} )
		//    .then( function( balance ){
		//    		console.log( 'balance',  balance );
		//    })
		//    .catch( function(excp){
		//    		console.log( 'Excp Error', excp  );
		//    })
		
		// 付款
		// pay.payout(0, 5, {
		// 	order_sn:'1484573213896171',
		// 	order_status:'DOING'
		// }).then( function( balance ){
		// 	console.log( 'balance:', balance  );
		// })
		// .catch( function(excp){
		// 	console.log( 'Excp Error', excp  );
		// });


		// console.log('sync', pay.isEnoughSync(15) );
	},

	tryselectin: function(){
		var tab = app.xpm.require('Table', 'order');

		tab.query()
		.join('user', 'user._id','=','order._user')
		.inWhere( "goods", "goods" )
		.fetch('order.*', 'user.name as uname').then(function( data ) {
				console.log( 'query response:', data);
		})
		.catch( function(excp) {
				console.log( 'query excp:', excp);
		});
	},

	tryjoingrouphaving: function() {

		var tab = app.xpm.require('Table', 'order');

		tab.query()

		.rightjoin('user', 'user._id','=','order._user')
		.where('user._id', '=', '1')
		.groupBy('status')
		.having('_id','>', 1)
		// .where('order.sn','=', '1484568116360872')
		.fetch('order.*', 'user.name as uname', 'user.nickName').then( function( data ){
			console.log( 'query response:', data);
		})
		.catch( function( excp ) {
			console.log( 'query excp:', excp);
		});

	},

	tryque: function() {

		var que = app.xpm.require('Que', 'hello');
		que.select('world').push('create', {  // 增加数据
			table:'payout',
			data: {
				sn:'200193',
				order_sn:'test29993',
				amount:100,
				status:'DONE'
			}
		}).push('update', { // 更新数据
			table:'order',
			data: {
				sn:'148457330261256',
				status_tips:'{{0.sn}} {{0.status}}'
			},
			unique:'sn'
		}).push('app', {   // 调用APP 示例
			'name':'xapp',
			'api':['ticket','index',{sn:'{{0.sn}}'}],
			'data': {
				sn:'{{0.sn}} {{1.sn}}',
				status:'DONE'
			}
		}).run().then(function(resp){
			console.log( 'Response', resp );
		})
		.catch(function(excp){
			console.log( 'Error', excp );
		})


		console.log( 'ok');
	},

	onLoad: function () {
		var user = app.xpm.require('User')
		
		user.login().then( function(resp){
			// console.log( 'login', 'Complete', resp );
			return user.tab.get( resp['_id']);

		}).then( function(resp) { 

			console.log( resp, 'user')
		})
		
		.catch( function(excp) {
			console.log( excp, 'error');
		});

	}
})






