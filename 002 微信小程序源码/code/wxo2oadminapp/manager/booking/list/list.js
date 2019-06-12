var common = require('../../common/common.js');
var app = getApp();
var _P = app.xpm.getPromise();


//获取应用实例
var app = getApp();
Page({
	data: {
		'sys':{},
		'manager':{}, // 管理员身份信息
		'booking':[],   //预约信息
	},

	// 转向订单详情页
	detail:function( e ) {
		
		var data = e.target.dataset;
		wx.navigateTo({
			url:'/manager/booking/detail/detail?id=' + data['id'],
			complete:function(){}
		});
	},

	// 下拉刷新
	onPullDownRefresh: function( e ){
		
		var that = this;

		this.getBooking().then( function( data ) {
			that.setData( data );
			return ;
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
	getBooking: function( page ) {
		var that = this,goods = {}, orders = [];
		var status = {
			'WAIT_CFM':{name:'等待确认', style:'text-warn'},
			'SUCCESS':{name:'预约成功', style:'text-primary'},
			'FAIL':{name:'预约失败', style:'text-warn'},
			'DONE':{name:'完成', style:'text-muted'},
			'CANCEL':{name:'已取消', style:'text-muted'}	
		};

		page = page || 1;
		return new _P( function( resolve, reject ) {
				
			if ( that.booking == null ) {
				that.booking = app.xpm.require('table', 'booking');	
			}


			that.booking.query()

				.where('status','<>', 'DONE' )
				.inWhere('goods','goods')
				.orderby('created_at', 'desc')
				.paginate(10, page )
				.fetch()
				
				.then(function( resp ) {

				var data = []; 

				for ( var i in resp['data'] ) {
					var goods = resp['data'][i]['goods'], g={};
					for( var j in goods ) { g = goods[j]; break; }
					
					try {
						resp['data'][i]['corver'] = g.corver;
						resp['data'][i]['show_name'] = g.name;
						resp['data'][i]['show_status'] = status[resp['data'][i].status];
						data.push( resp['data'][i] );
					} catch( e ){}
				}


				resolve({'booking':data});
			})
			.catch( function( excp ) {
				reject(excp);
			})
		})

	},

	onShow: function() {

		wx.showToast({
		  title: '读取中',
		  icon: 'loading',
		  duration: 10000
		});

		var that = this;

		// 拉取预约订单信息
		this.getBooking().then( function( data ){

			that.setData( data );
		})

		.catch( function( excp ){
			wx.hideToast();
			return;
		})

		.then(function(){
			wx.hideToast();
		})
	},

	onLoad: function () {
			
		var that = this;
		common.extend( this );
		common.title('预约处理');


		this.setData({'sys':wx.getSystemInfoSync()});
		this.booking = app.xpm.require('table', 'booking');	
		this.goods = app.xpm.require('table', 'goods');

	},

	booking: null,  // 订单表
	goods: null   // 商品表

})