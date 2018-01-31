//获取应用实例
var pay = require("../../../../utils/pay.js");
var app = getApp();
var _P = app.xpm.getPromise();

Page({
  data: {
    testsis:'/res/icons/testsis.jpg',
    testfour:'/res/icons/testfour.jpg',
    userInfo:'/res/icons/testsis.jpg',
    black:'/res/icons/black.jpg'
  },

  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    console.log(link);
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
  onLoad: function (){
      var that   = this;
      that.pay   = new pay();
      var  payout = app.xpm.require('Table', 'payout');
      that.pay.userdata().then(function(data){
            payout.query()
                .where('uid', '=', data['0']._id)
                .fetch('*').then(function(data) {
                    that.setData({data:data});
                })
      })
    }
})