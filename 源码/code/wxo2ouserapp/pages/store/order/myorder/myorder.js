//获取应用实例
var payin   = require("../../../../utils/pay.js");
var app = getApp();
var _P = app.xpm.getPromise();
Page({
  data: {
    testsis:'/res/icons/testsis.jpg',
    testfour:'/res/icons/testfour.jpg',
    black:'/res/icons/black.jpg',
 
  },
  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
    // 转向订单详情页
  detail:function( e ) {
      var data = e.target.dataset;
      wx.navigateTo({
        url:'/pages/store/order/detail/detail?id=' + data['id'],
        complete:function(){}
      });
    },
    /**
   * 读取订单列表
   * @param  {[type]} page [description]
   * @return {[type]}      [description]
   */
  getOrders: function( page ) {
    var that = this,
    goods = {}, 
    orders = [];
    page = page || 1;
    return new _P( function( resolve, reject ) {
      if( that.order == null ) {
        that.order = app.xpm.require('table', 'order'); 
      }

      if( that.goods == null ){
        that.goods = app.xpm.require('table', 'goods');
      }
      that.order.query()
        .where('status','<>','CANCEL') // 忽略已取消订单
        .where('status','<>','DONE')  // 忽略已完成订单
        .inWhere('goods','goods')
        .paginate(10,  page)
        .orderby('created_at', 'desc')

      .fetch('*').then( function( resp ) {  // 读取订单信息
        var data = resp['data'];

        for( var i in data ) {
          for( var j in data[i]['goods'] ) {
            goods[j] =  data[i]['goods'][j];
          }
        }

        var gids = [];
        for( var idx in goods ) {
          gids.push(idx);
        }

        orders = resp;

        var status = {
          'WAIT_PAY':{name:'待付款', style:'text-warn'},
          'WAIT_CFM':{name:'待确认', style:'text-warn'},
          'PENDING':{name:'配送中', style:'text-muted'},
          'DOING':{name:'服务中', style:'text-muted'},
          'WAIT_RWD':{name:'待评价', style:'text-primary'},
          'DONE':{name:'完成', style:'text-muted'},
          'CANCEL':{name:'已取消', style:'text-muted'} 
        };
        // 处理订单渲染数据
        for( var i in orders['data'] ) {
          var o = orders['data'][i],  
          gid = null;
          for( var j in orders['data'][i]['goods'] ) { gid=j; break; };



          o['show_status'] = status[o.status];
          o['show_name'] = goods[gid]['name'];
          o['corver'] = goods[gid]['corver'];

          if ( typeof Object.keys == 'function' ) {
            if ( Object.keys(orders['data'][i]['goods']).length > 1 ) {
              o['show_name'] = o['show_name'] + '等';
            }
          }
        }

        resolve({'orders':orders['data'], 'goods':goods});
      }).catch( function( excp ){
        reject(excp);
      });

    })
  },
  onLoad: function () {
    var that = this
    that.pay =   new payin();
    var order = app.xpm.require('Table','order');
    that.pay.userdata().then(function(data){
        var id = data['0']._id;
        // 查询order
        that.getOrders().then(function(data){
          that.setData({data:data.orders});
        });
    });
  }
})