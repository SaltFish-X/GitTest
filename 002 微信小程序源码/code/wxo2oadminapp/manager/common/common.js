var app = getApp();
var _P = app.xpm.getPromise();

function common() {

	this.page = null;	

	// this.utils = app.xpm.require('Utils');

	this.extend = function( page  ) {

		this.page = page;

		// 管理员登录
		var manager = app.session.get('_manager');
		if ( manager  == null ) {  // 无管理权限
			wx.switchTab({url:'/manager/order/user/user'});
			return;
		}

		page.setData({'common':{'manager': manager}});
		page.onMangerbarTap = function( e ) {
			var link = e.target.dataset.link;
			if (typeof link == 'string') {
				try { wx.switchTab({url:link}); } catch(e){}
			}
		}

		page.onUserbarTap = function(e){
			var mobile = e.target.dataset.mobile;
			try { 
				wx.makePhoneCall({
					phoneNumber: mobile //仅为示例，并非真实的电话号码
				})
			} catch(e){}
		}
	}

	this.userbar = function( user ) {
		var that = this;
		if ( typeof user == 'object' ) {
			user.online = user.online || 'off';
			this.page.setData({'common.user': user} );
		} else {

			this.user().get( user ).then(function( data ){
				data.online = data.online || 'off';
				that.page.setData({'common.user': data } );
			}).catch(function(){});
		}
	}

	this.table = function( table ) {
		return app.xpm.require('table', table);	
	}

	this.user = function(){
		return app.xpm.require('User');
	}

	this.title = function( title ) {
		wx.setNavigationBarTitle({ title: title});
	}
}

module.exports = new common();