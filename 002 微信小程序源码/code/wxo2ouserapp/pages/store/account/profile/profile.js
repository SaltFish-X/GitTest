//获取应用实例
var pay   = require("../../../../utils/pay.js");
var app = getApp();
var _P = app.xpm.getPromise();
Page({
  data: {
    size:'mimi',
    mode:'aspectFit',
    src:'/res/icons/lcc.png',
    user:'/pages/store/user/user/user'
 },
  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
  // 设置家里地址
  address_1:function(){
      var that = this;
      that.pay = new pay();
      that.address().then(function(res){
          that.data.userdata.addr_01=res;
          that.setData({userdata:that.data.userdata});
      });
  },
  // 设置公司地址
  address_2:function(){
    var that = this;
    that.address().then(function(res){
          that.data.userdata.addr_02=res;
          that.setData({userdata:that.data.userdata});
    });
  },
  // 提交
  formSubmit:function(e){
    var that = this; 
    var user = app.xpm.require('Table','user');
    that.pay.userdata().then(function(data){
        user.update(data['0']._id,{
            mobile:e.detail.value.mobile,
          addr_01:e.detail.value.addr_01,
          addr_02:e.detail.value.addr_02
        }).then(function(){
            wx.showToast({
              title: '设置成功',
              icon: 'success',
              duration: 2000
            })
             wx.navigateTo({url:'/pages/store/account/profile/profile'});
        }).catch( function(excp){
          console.log( 'Excp Error', excp  );
        });
    })
  },
  // 地址设置
  address:function(){
    var that = this;
    return new _P(function (resolve,reject){
      wx.getLocation({
            type: 'gcj02', 
            success: function(res){
                wx.chooseLocation({
                     success: function(res) {
                          resolve(res.address);
                      },
                })
            }
         });
     })
  },
  onLoad: function () {
      var that = this;
      that.pay = new pay();
      that.pay.userdata().then(function(data){
          that.setData({userdata:data['0']});
      })
    }
})