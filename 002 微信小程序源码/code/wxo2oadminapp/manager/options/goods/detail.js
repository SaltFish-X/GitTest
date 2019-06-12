var common = require('../../common/common.js');
var app = getApp();
var _P = app.xpm.getPromise();

//获取应用实例
Page({
	
	data: {
		rs:{status_show:{'tpl':'online'}},
		member:[],
		status:{
			'online':{name:'已上架', style:'text-primary', tpl:'online'},
			'offline':{name:'已下架', style:'text-warn', tpl:'offline'}
		},
		type:{
			data:['线上商品','线下服务'], 
			curr:0, 
			map:{goods:0, service:1}
		}
	},

	// 下拉刷新
	onPullDownRefresh: function( e ){
		
		var that = this, rsData = {};

		this.getData().then( function( respRS  ) {

			rsData = respRS;

			if ( app.utils.empty(that.data.member)) {
				return that.options.query().fetch('member');	
			} else {
				return that.data.member;
			}
		})

		.then( function( respMember  ) {
			that.data.member = respMember;
			that.render( rsData );
			return;
		})

		.then(function() {
			wx.stopPullDownRefresh();
		});	
	},

	corverchange: function(e) {
		var that = this;
		wx.chooseImage({
		  count: 1, // 默认9
		  sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
		  sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
		  success: function (res) {
		    var tempFilePaths = res.tempFilePaths;
		    var qcloud = app.xpm.require('app', 'xqcloud');
		    	
		    	qcloud.api("cos",'upload')
		    		.upload( tempFilePaths[0] )

		    		.then(function(data){
		    			that.setData({
		    				'rs.corver':data.access_url,
		    				'rs.images':[data.access_url]
		    			});
		    		})
		    		.catch( function(excp){
		    			console.log('Upload Fail', excp );
		    		});
		  }
		})
	},


	pricechange:function(e) {
		var name = e.currentTarget.dataset.name;
		var value = e.detail.value;

		if ( name == 'price' ) {
			this.setData({'rs.price': value} );

			var data = this.data.rs;
			data['price_list'] = [];
			for ( var i in this.data.member ) {
				
				var mb = this.data.member[i]['member'];
					mb.price = (new Number(data['price']) * new Number(mb.discount)).toFixed(0);
					mb.price_show = (mb.price/100).toFixed(2)
				data['price_list'].push(mb);
	 		}

	 		data['price_show'] = (new Number(data['price'])/100).toFixed(2);

	 		this.setData({rs:data});

		} else {
			var data = this.data.rs;
				data['price_list'][name] = data['price_list'][name] || {};
				data['price_list'][name]['price'] = ( new Number(value)) .toFixed(0);
				data['price_list'][name]['price_show'] = ( new Number(value)/100 ).toFixed(2);
			this.setData({rs:data});
		}
	},

	textchange: function(e) {
		var name = e.currentTarget.dataset.name;
		var obj = this.data.rs || {};
			obj[name] = e.detail.value;
			// console.log( name, e.detail.value );
		this.setData({rs:obj});
	},

	pickerchanage:function(e){
		this.textchange( e );

		var curr = e.detail.value;
		this.setData({
			'type.curr':e.detail.value, 
			'rs.type_name':this.data.type.data[curr]}
		);
	},

	render: function( data ) {

		data = data || {};

		// 处理商品类型
 		data.type = data.type || 'goods';
		var curr = this.data.type.map[data.type];
			this.data.type.curr = curr;
			data['type_name'] = this.data.type.data[curr];

		// 处理商品定价
		data['price'] = data['price'] || 0;
		data['price_show'] = (new Number(data['price'])/100).toFixed(2);
		data['price_list'] = [];
		for ( var i in this.data.member ) {
			var mb = this.data.member[i]['member'];

			data['real_price'] = data['real_price'] || {};
			if ( typeof data['real_price'][mb.group] != 'undefined' ) {
				mb.price = new Number(data['real_price'][mb.group]);
			} else {

				
				mb.price = new Number(data['price']) * new Number(mb.discount);
			}

			mb.price = mb.price.toFixed(0);
			mb.price_show = (mb.price/100).toFixed(2);
			data['price_list'].push(mb);
 		}

 		// 处理封面图片
 		data['corver'] = data['corver']  || '/res/icons/addimage.jpg';

 		// 处理商品状态
 		data.status = data.status || 'offline';
 		
 		// 处理表单状态
 		data['status_show'] = this.data.status[data.status];
			
		this.setData({rs:data});
	},

	getData: function() {

		var that = this;
		var id = this.params['id'] || 0;

		return new _P( function( resolve, reject ) {
			
			if ( id == 0 ) {
				resolve({});
			}

			that.tab.get(id).then(function( data ) {
				
				if ( typeof data['_id'] == 'undefined') {
					resolve({});
				}

				resolve(data);

			})
			.catch(function(excp){
				reject(excp);
			})
		});
	},

	onLoad: function( params ) {
		
		common.extend( this );
		common.title('会员详情-店铺管理');

		var that = this;
		this.params = params;
		this.tab = common.table('goods');
		this.options = common.table('options');
		this.onPullDownRefresh();
		
	},


	// 预约处理功能函数
	savedata: function( data ) {
		data = data || {};
		var that = this;
		var ut = app.xpm.require('Utils');
		var id = this.params['id'] || 0;

		data = data || {};
		data = ut.merge( this.data.rs, data );

		// Fix price
		if ( typeof data['price_list'] == 'object' ) {
			data['real_price'] = {};
			for ( var i in  data['price_list'] ) {
				var m = data['price_list'][i];
				data['real_price'][m.group] = m.price;
			}
		}

		// 上传图片
		if ( data['upflag'] == true ) {
			console.log('Image Need Uploading ');
		}
		

		wx.showToast({
		  title: '保存中',
		  icon: 'loading',
		  duration: 10000
		});

		if ( id != 0  ) {
			this.tab.update(data['_id'], data )
		
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
		} else {
			this.tab.create(data)
		
			.then(function( resp ) {

				wx.showToast({
				  title: '完成',
				  icon: 'success',
				  duration: 1000
				});
				that.params['id'] = resp['_id'];
				that.onPullDownRefresh();
			})

			.catch( function( resp ) {
				console.log( 'excp',  resp );
			});
		}

	},

	save: function() {
		var that = this;
		wx.showModal({
		  title: '确认保存?',
		  content: '请确认修改商品信息',
		  success: function(res) {
		    if (res.confirm) {
		    	that.savedata();
		    }
		  }
		})
		
	},

	online: function() {
		var that = this;
		wx.showModal({
		  title: '确认上架?',
		  content: '请确认上架商品',
		  success: function(res) {
		    if (res.confirm) {
		    	that.savedata({status:'online'});
		    }
		  }
		})
		
	},

	offline: function() {
		var that = this;
		wx.showModal({
		  title: '确认下架?',
		  content: '请确认下架商品',
		  success: function(res) {
		    if (res.confirm) {
		    	that.savedata({status:'offline'});
		    }
		  }
		})
		
	},

	addnew: function() {
		var that = this;
		wx.showModal({
		  title: '确认添加?',
		  content: '请确认添加商品',
		  success: function(res) {
		    if (res.confirm) {
		    	that.params['id'] = 0;
		    	that.onPullDownRefresh();
		    }
		  }
		})
	},

	rmit: function() {
		var that = this;
		wx.showModal({
		  title: '确认删除?',
		  content: '请确认删除商品',
		  success: function(res) {
		    if (res.confirm) {

		    	if( that.params['id'] != 0 ) {
		    		that.tab.remove(that.params['id'])
		    			.then(function( resp ){
		    				wx.navigateBack();
		    			});
		    	} else {
		    		wx.navigateBack();
		    	}
		    }
		  }
		})
	},

	backlist: function(){
		wx.navigateBack();
		// wx.navigateTo({url:'/manager/options/member/list'});
		// console.log(getCurrentPages());
	},	

	options:null,
	tab:null,
	params:{},
	goods:null,
	booking:null,
	user:null
})