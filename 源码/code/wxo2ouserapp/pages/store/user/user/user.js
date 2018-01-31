//获取应用实例
var app = getApp();
var _P = app.xpm.getPromise();

Page({
  data: {
    link:'/pages/store/account/index/index',
    pages: [
        {name:'进入商店',link:'/pages/store/products/list'},
        {name:'在线预约',link:'/pages/store/booking/detail/detail'},
        {name:'我的订单',link:'/pages/store/order/myorder/myorder'},
        {name:'我的账户',link:'/pages/store/account/index/index'}
      ]
  },
  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
  // 生成随机数
  randomnum: function() {
      var myDate   = new Date();
      var timenow = String(myDate.getHours())+String(myDate.getMinutes());
      var res = "";
      var chars = ['0','1','2','3','4','5','6','7','8','9'];
      for(var i = 0; i <3 ; i ++) {
        var id = Math.ceil(Math.random()*9);
        res += chars[id];
      }
      var num = res+timenow;
      return num;
  },
  onLoad: function () {
      // 登录操作
      var that = this;
      var user = app.xpm.require('User');

      user.login().then( function( userInfo ) { 
        
        return user.tab.get(userInfo['_id']); // 查询客户完整数据
                                              
      }).then(function( uinfo ) {
          // 查询数据表有没有empty
          if(uinfo.cid==null||uinfo.cid==''){
              var num = that.randomnum();
              user.tab.update(uinfo._id,{cid:num});
          };
          that.setData({user:uinfo});
      })
      .catch( function(excp ) {
          console.log( excp );
      });
    }
})