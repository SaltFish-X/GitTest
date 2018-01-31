//获取应用实例
var Goods = require("../../../utils/goods.js");
var app = getApp();
var _P = app.xpm.getPromise();
Page({

  data: {
    autoplay: true,
    interval: 3000,
    shop:'/res/icons/shop.png',
    order:'/pages/store/order/confirm/confirm'
  },
  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    console.log(link);
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
  //事件处理函数
   bindViewTap: function() {
      wx.navigateTo({
        url: '../logs/logs'
      })
  },
  // 清空购物车
  cleanup:function(){
    this.utils.cart.clean();
    this.setData({cart:{total:0, sale_price:0, show_price:'0.00' }});
  },
  // 清空购物车
  cleanup:function(){
    this.utils.cart.clean();
    this.setData({cart:{total:0, sale_price:0, show_price:'0.00' }});
  },
  //加入购物车
  addtocart: function( e ) {
    var data = e.target.dataset,cart={};
    this.utils.cart.add(data['id'], data['price'], data['amount']);
    var cart = this.utils.cart.total();
    this.setData({cart:cart});
  },
  //把数据插入数组头部
  prepend:function (arr, item) {
    return [item].concat(arr);
  },
  onLoad: function (e) {
      var that =this;
      var user = app.xpm.require('User');
      if(e._id==null||e._id==''){
        return;
      };
      that.setData({_id:e._id});
      // 通过id查询出当前html
      var goods = app.xpm.require('Table','goods');
      user.login().then( function( userInfo ) {
        that.utils = new Goods(userInfo,app.session);
        var cart = that.utils.cart.total();
        that.setData({'cart':{total:cart.total,show_price:cart.show_price}});
        goods.query()
          .where('_id', '=',e._id)
          .limit(1)
          .fetch('*').then(function(data) { 
          var dataes = that.utils.fliter(data);
          var images =that.prepend(data['0'].images,data['0'].corver);
          // 设置图片
          that.setData({images:images});
          // 设置描述
          that.setData({user:data['0'].summary});
          // 设置价格
          that.setData({price:dataes['0'].show_price});
          that.setData({idprice:dataes['0'].price});
          // 设置正文
          that.setData({body:data['0'].body});
           // 设置名字
          that.setData({name:data['0'].name});

        })
    });
  }
})