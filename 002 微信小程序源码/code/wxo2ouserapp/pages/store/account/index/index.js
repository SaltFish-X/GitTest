var pay = require("../../../../utils/pay.js");
var payment = require("../../../../utils/payment.js");
//获取应用实例
var app = getApp();
var _P = app.xpm.getPromise();

Page({
  data: {
    ewm:'/res/icons/ewm.png',
    payin:'/pages/store/history/payin/payin',
    payout:'/pages/store/history/payout/payout',
    userurl:'/pages/store/account/profile/profile',
    ewmlink:'/pages/store/account/qrcode/qrcode',
  },
  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
  // 支付
  payout:function(){
      wx.navigateTo({url:'/pages/store/account/income/income'});  
  },
  onLoad: function () {
    var that = this;
    var user = app.xpm.require('User');
    var that = this;
    // 检测缓存中是否存在userid
    that.pay = new pay();
    that.pay.userdata().then(function(data){
        that.setData({user:data['0']}); 
        that.payment  = new payment(data['0']._id,app.session);
        that.payment.balance(true).then(function(data){
          that.setData({amount:data.total/100}); 
        })
    });
  }
})