//获取应用实例
var Goods = require("../../../../utils/goods.js");
var app = getApp();
var _P = app.xpm.getPromise();

Page({
  data: {
    order:'/pages/store/order/confirm/confirm',
    type:'upload'
  },
  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
  page:function(e){
    var data = e.currentTarget.dataset;
    wx.navigateTo({ url:'/pages/store/products/detail?_id='+ data.id});
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
  // 下拉刷新
  upper:function() {
    var  that = this;
    var  num = this.data.page;
    var  type = this.data.type;
    var  datalast = this.data.data;
    // 判断是否加载完毕
    if(type=='load'){
      // 把状态未加载7
      that.setData({'type':'load'});
      // 获取当前页数+1
      var addnum = parseFloat(num)+1;
      var table = app.xpm.require('Table','goods');
      table.query().paginate(10,addnum).fetch('*').then(function(data){ 
        if(data.current_page==null||data.current_page==''){
           return;
        };
        if(data.current_page==addnum){
          var dataes = that.utils.fliter(data.data);
          // 数组融合
          var mes = datalast.concat(dataes);
          that.setData({'data':mes});
          // 设置页码
          that.setData({'page':addnum});
          // 设置状态
          that.setData({'type':'load'});
        };
      });
    };
  },
  // 初始化载入
  onLoad: function () {
    var that = this;
    // 查询user
    var user = app.xpm.require('User');
    var table = app.xpm.require('Table','goods');
    var res = wx.getSystemInfoSync();
    // 设置页面高度
    that.setData({'height':res.windowHeight});
    // 设置数据并且设置分页
    that.setData({'type':'unload'});
    // 设置用户id
    user.login().then( function( userInfo ) {
          table.query().paginate(10,1).fetch('*').then(function(data){ 
          // 设置userid
          that.setData({'userid':userInfo._id});
          // 实例化goods
          that.utils = new Goods(userInfo,app.session);
          var cart = that.utils.cart.total();
          that.setData({'cart':{total:cart.total,show_price:cart.show_price}});
          var dataes = that.utils.fliter( data.data);
          that.setData({'data':dataes});
          that.setData({'page':'1'});
          // 加载成功
          that.setData({'type':'load'});
        })
    });
  },
  utils: null,
  goods:null
})