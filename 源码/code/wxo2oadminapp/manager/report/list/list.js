var common = require('../../common/common.js');

//获取应用实例
var app = getApp();
var _P = app.xpm.getPromise();

Page({
	data: {
		'user':{},
		"reports":[
			{name:'商品管理', icon:'/res/icons/chart.png', url:'/manager/order/list/list' },
			{name:'会员等级', icon:'/res/icons/chart.png', url:'/manager/order/list/list' },
			{name:'添加商品', icon:'/res/icons/chart.png', url:'/manager/order/list/list' }
		]
	},

	onLoad: function () {

		var that = this;
		common.extend( this );
		common.title('经营日报');

		var reports = this.getReports();
		this.setData({'reports':reports});
		
	},

	getReports: function( from, limit  ) {

		from  = from || null;
		limit = limit || 7;

		var myDate = new Date(); //获取今天日期
			// myDate.setDate(myDate.getDate() - 1);

		if ( from != null ) {
			myDate.setDate(from);
		}


		myDate.setDate(myDate.getDate() - limit);
		var dateArray = []; 
		var flag = 1; 
		for (var i = 0; i < limit; i++) {

		    var name = myDate.getFullYear() + '年' 
		    	name += myDate.getMonth() + 1;
		    	name += '月' 
		    	name += myDate.getDate() + '日' + ' 经营日报';

		    dateArray.push({
		    	name:name,
		    	icon:'/res/icons/chart.png',
		    	url:'/manager/order/list/list'
		    });

		    myDate.setDate(myDate.getDate() + flag);

		}

		dateArray.reverse();

		return dateArray;

	},

	user:null
})