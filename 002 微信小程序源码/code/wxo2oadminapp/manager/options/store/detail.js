var common = require('../../common/common.js');
var app = getApp();
var _P = app.xpm.getPromise();

//获取应用实例
Page({
	
	data: {
		member:{},
	},

	// 下拉刷新
	onPullDownRefresh: function( e ){
		
		var that = this;

		this.getOptions().then( function( data ) {
			that.setData( {member:data} );
			return;
		})

		.then(function() {
			wx.stopPullDownRefresh();
		});
		
	},

	textchange: function(e) {
		var name = e.currentTarget.dataset.name;
		var obj = this.data.member || {};
			obj[name] = e.detail.value;
		this.setData({member:obj});

	},

	

	getOptions: function() {

		var that = this;
		var id = this.params['id'] || 0;

		return new _P( function( resolve, reject ) {
			
			if ( id == 0 ) {
				resolve({});
			}

			that.options.get(id).then(function( data ) {
				
				if ( typeof data['_id'] == 'undefined') {
					resolve({});
				}

				data['member']['_id'] = data['_id'];
				resolve(data['member']);

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
		data = ut.merge( this.data.member, data );

		wx.showToast({
		  title: '保存中',
		  icon: 'loading',
		  duration: 10000
		});

		if ( id != 0  ) {
			this.options.update(data['_id'], {member:data} )
		
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
			this.options.create({member:data})
		
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
		  content: '请确认修改会员信息',
		  success: function(res) {
		    if (res.confirm) {
		    	that.savedata();
		    }
		  }
		})
		
	},

	addnew: function() {
		var that = this;
		wx.showModal({
		  title: '确认添加?',
		  content: '请确认添加会员',
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
		  content: '请确认删除会员',
		  success: function(res) {
		    if (res.confirm) {

		    	if( that.params['id'] != 0 ) {
		    		that.options.remove(that.params['id'])
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

	params:{},
	goods:null,
	booking:null,
	user:null
})