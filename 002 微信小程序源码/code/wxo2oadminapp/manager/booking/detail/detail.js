var common = require('../../common/common.js');
var app = getApp();
var _P = app.xpm.getPromise();


//获取应用实例
Page({
	
	data: {
		service:[],
		goods:[],
		current:0,
		booking:{show_status:{'tpl':'wait_cfm'}},
		manager:{},
		user:{}
	},

	// 下拉刷新
	onPullDownRefresh: function( e ){
		
		var that = this;

		this.getBooking().then( function( data ) {
			that.setData( data );
			return;
		})

		.then(function() {
			wx.stopPullDownRefresh();
		});
		
	},

	status_tips: function(e) {
		this.setData({'booking.status_tips':e.detail.value});
	},

	when_date: function(e) {
		this.setData({'booking.when_date':e.detail.value});
	},

	when_time: function(e) {
		this.setData({'booking.when_time':e.detail.value});
	},

	service: function(e) {
		this.setData({'current':e.detail.value});
	},

	getSevices: function() {
		var that = this;
		return new _P( function( resolve, reject ) {
				
			if ( that.goods == null ) {
				that.goods = app.xpm.require('table', 'goods');	
			}

			that.goods.query()
				.where('status','=','online')
				.where('type','=','service')
				.fetch('_id','name')

			.then( function( data ){

				var se =[],curr=0;

				for( var idx in data  ) {
					if ( that.params['id'] == data[idx]['_id'] ) {
						curr = idx;
					}

					se.push( data[idx]['name']);
				}
				resolve({service:se, current:curr, goods:data});
			})
			.catch( function( excp ) {
				reject(excp);
			})
		});
	},

	getBooking: function( id ) {

		this.params['id'] = this.params['id'] || 0;
		id = id || this.params['id'];
		
		var that = this,goods = {}, orders = [];
		
		var status = {
			'WAIT_CFM':{name:'等待确认', style:'text-warn', tpl:'wait_cfm'},
			'SUCCESS':{name:'预约成功', style:'text-primary', tpl:'success'},
			'FAIL':{name:'预约失败', style:'text-warn', tpl:'fail'},
			'DONE':{name:'完成', style:'text-muted', tpl:'complete'},
			'CANCEL':{name:'已取消', style:'text-muted', tpl:'complete'}	
		};

		return new _P( function( resolve, reject ) {
				
			if ( that.booking == null ) {
				that.booking = app.xpm.require('table', 'booking');	
			}


			that.booking.query()

				.leftjoin('user', 'user._id','=','booking.uid')
				.where('booking._id','=', id )
				.inWhere('goods','goods')
				.limit(1)
				.fetch('booking.*', 'user.avatarUrl','user.name', 'user.mobile')
				
			.then(function( data ){ 


				if ( data.length != 1 ) {
					reject({code:404, message:'预订单不存在', extra:{data:data}});
					return;
				}

				for ( var i in data ) {
					var goods = data[i]['goods'], g={};
					for( var j in goods ) { g = goods[j]; break; }
					
					data[i]['corver'] = g.corver;
					data[i]['show_name'] = g.name;
					data[i]['show_status'] = status[data[i].status];

					// 优化默认到店时间范围
					var now = new Date();
					data[i]['date_scope'] = {
						start:now.getFullYear() +'-'+ (now.getMonth() + 1) + '-01',
						end:now.getFullYear()+1 +'-'+ (now.getMonth() + 1) + '-31',
					};

					// 处理到店日期
					// console.log( Date.parse(data[i]['when']) );
					var when = new Date(data[i]['when']);
					var m = (when.getMonth() + 1).toString();
					var h = when.getHours().toString();
					var d = when.getDate().toString();
					var min= when.getMinutes().toString();
						if ( m.length ==  1 ) m = '0'+m;
						if ( min.length ==  1 ) min = '0'+min;
						if ( h.length ==  1 ) h = '0' + h;
						if ( d.length ==  1 ) d = '0' + d;

					data[i]['when_date'] = when.getFullYear() +'-'+ m + '-' + h;
					data[i]['when_time'] = h + ':' + min;
 
					// console.log( data[i]['when_date'], data[i]['when_time'] );
				}
				
				resolve({'booking':data[0]});

			})
			.catch( function( excp ) {
				reject(excp);
			})
		})

	},

	onLoad: function( params ) {
		
		common.extend( this );
		common.title('预约详情');

		var that = this;

		this.params = params;
		this.goods = common.table('goods');
		this.booking = common.table('booking');	
		this.user =  common.user();

		this.getBooking().then( function( data ) {
			that.setData( data );
			common.userbar( data['booking']);

		}).catch( function( excp ){
			console.log( excp );
		})

		this.getSevices().then( function( data ) {
			that.setData( data );
		}).catch( function( excp ){
			console.log( excp );
		});

	},


	// 预约处理功能函数
	update: function( data ) {
		var that = this;
		var ut = app.xpm.require('Utils');
		var g  = this.data.goods[this.data.current] || {};

		data = ut.merge( this.data.booking, data );
		data['goods'] = {};

		data['when'] = data['when_date'] + ' ' + data['when_time'];
		data['goods'][g['_id']] = {id:g['_id']};

		console.log( data );

		wx.showToast({
		  title: '更新中',
		  icon: 'loading',
		  duration: 10000
		});

		this.booking.update(data['_id'], data)
		
		.then(function( resp ) {

			wx.showToast({
			  title: '完成',
			  icon: 'success',
			  duration: 1000
			});

			that.onPullDownRefresh();

		})

		.catch( function( resp ) {
			console.log( 'excp',  resp );
		});

	},

	confirm: function() {
		var that = this;
		wx.showModal({
		  title: '确认接受?',
		  content: '请确认接受预约申请',
		  success: function(res) {
		    if (res.confirm) {
		    	that.update({'status':'SUCCESS'});
		    }
		  }
		})
		
	},

	reject:function() {
		var that = this;

		wx.showModal({
		  title: '确认拒绝?',
		  content: '请确认拒绝预约申请',
		  success: function(res) {
		    if (res.confirm) {
		    	that.update({'status':'FAIL'});
		    }
		  }
		})
	},

	cancel: function() {
		var that = this;
		wx.showModal({
		  title: '确认取消?',
		  content: '请确认取消预约申请',
		  success: function(res) {
		    if (res.confirm) {
		    	that.update({'status':'CANCEL'});
		    }
		  }
		})
		
	},

	reset: function() {
		var that = this;
		wx.showModal({
		  title: '确认重置?',
		  content: '请确认重置预约申请',
		  success: function(res) {
		    if (res.confirm) {
		    	that.update({'status':'WAIT_CFM'});
		    }
		  }
		})
	},

	done: function() {
		var that = this;
		wx.showModal({
		  title: '标记完成?',
		  content: '请确认标记预约完成',
		  success: function(res) {
		    if (res.confirm) {
		    	that.update({'status':'DONE'});
		    }
		  }
		})
	},

	params:{},
	goods:null,
	booking:null,
	user:null
})