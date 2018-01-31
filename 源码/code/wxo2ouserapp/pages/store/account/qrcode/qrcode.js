var pay = require("../../../../utils/pay.js");
//获取应用实例
var app = getApp();
var _P = app.xpm.getPromise();
Page({
  data: {
  },
  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
  onLoad: function () {
    var that = this;
    var user = app.xpm.require('User');
    var that = this;
    that.pay  = new pay();
    that.pay.userdata().then(function(data){
       var cid =  data['0'].cid;
       that.utils = app.xpm.require('utils');
       var ermlink = that.utils.qrImageUrl(cid,{
          size:600,
          label:'  '
      })
      that.setData({qrurl:ermlink});
      that.setData({user:data['0']});
    })
  }
})