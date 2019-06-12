//获取应用实例
var app = getApp();
var _P = app.xpm.getPromise();

var payment = require("../../../../utils/payment.js");
var pay = require("../../../../utils/pay.js");
Page({
  data: {
   size: 'mini'
  },


  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
  // 生成随机数
  randomnum:function(){
    var timestamp = (new Date()).valueOf();
    return timestamp.toString() + Math.ceil(Math.random()*1000).toString();
  },
  // 确认支付
  income: function( e ){
      var amount = e.detail.value.amount;
      var that = this;
      that.pay  = new pay();
      // 数据表添加
      var user = app.xpm.require('User');
      var income = app.xpm.require('Table','income');
      if(!isNaN(amount)){
            var totalnum  = amount*100;
            if (totalnum=='0'){
                wx.showModal({
                  title: '警告',
                  content: '您还没有输入数字',
                  showCancel:false
                })
                return;
              };
              that.pay.userdata().then(function(data){
                  if (data['0']==''||data['0']==null||data['0']==undefined){
                      wx.showModal({
                          title: '错误',
                          content: '无法获取用户',
                          showCancel:false
                        })
                        return;
                  }
                 var payout     =  new payment(data['0']._id,app.session);
                 payout.income(totalnum,'',{body:'余额充值'})
                   .then( function( balance ){
                       wx.redirectTo({url:'/pages/store/account/index/index'});
                       console.log( 'balance', balance );
                   }).catch( function(excp){
                       console.log( 'Excp Error', excp  );
                   });
              })
        }else{
        wx.showModal({
          title: '警告',
          content: '必须为数字',
          showCancel:false
        })
      };
  },
  // 取消支付
  unpayout: function( e ) {
    wx.redirectTo({ url:'/pages/store/account/index/index'});
  },
  onLoad: function () {
    

  },

})