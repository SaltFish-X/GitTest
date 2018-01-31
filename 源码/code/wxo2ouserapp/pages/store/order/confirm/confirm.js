var Goods = require("../../../../utils/goods.js");
var pay   = require("../../../../utils/pay.js");
var Payment = require("../../../../utils/payment.js");
var app = getApp();
var _P = app.xpm.getPromise();

//获取应用实例
Page({
  data: {
    goods:{},
    disabled:'',
    type:'changement'
  },
  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
  onPullDownRefresh: function( e ){
    
    var that = this;

    this.getBooking().then( function( data ) {
      that.setData( data );
      return;
    })

    .then(function() {
      wx.stopPullDownRefresh();
    });
    
  },
  back:function(){
     wx.navigateBack();
  },
  // 手机号输入
  mobile:function(e){
    var that    = this;
    that.setData({'mobile':e.detail.value});
  },
  // 地址输入
  address:function(e){
    var that    = this;
    that.setData({'address':e.detail.value});
  },
  map:function(e){
    var that    = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        var latitude = res.latitude;
        var longitude = res.longitude; 
        wx.chooseLocation({
          success: function(res) {
            that.setData({address:res.address});
          },
        });
      }
    })
  },
  incr: function(e) {
    var data = e.target.dataset, 
    cart={}, 
    newdata={};
    var id = data['id'] || null;
    if ( id == null ) return;
    var good = this.data.goods[id] || {} , 
    amt = new Number(this.data.goods[id]['amount']);
    this.utils.cart.add(good['id'], good['sale_price'], 1 );
    cart = this.utils.cart.total();
    amt = amt + 1;
    newdata = {cart:cart};
    newdata["goods."+ id + ".amount"] = amt;
    this.setData(newdata);
  },
  disc: function(e) {
    var data = e.target.dataset, cart={}, newdata={};
    var id = data['id'] || null;
    if ( id == null ) return;

    var good = this.data.goods[id] || {} , amt = new Number(this.data.goods[id]['amount']);

    this.utils.cart.rm(good['id'], 1);
    cart = this.utils.cart.total();
    newdata = {cart:cart};

    // 删除
    amt = amt - 1;
    if ( amt <  0 ) {
      amt = 0;
    }
    newdata["goods."+ id + ".amount"] = amt;
    this.setData(newdata);
  },
  // 勾选
  come: function(e) {
    var data = e.currentTarget.dataset;
    this.setData({'type':data.value});
  },
  // 微信支付
  wxpay:function(e){
    var that  = this;
    // 判断
    var changeres = that.changement();
    if (changeres=='error') {
      return;
    };
    // 加入订单表
    that.ordermake().then(function(data){
          var orderid = data._id;
          var ordersn = data.sn;
          var total   = that.data.cart.total;
          that.setData({'pid': orderid});
          if(!isNaN(orderid)){ 
            // 重组obj
            var resdata = {
              sn:ordersn,
              total:total,
              _id:orderid
            }
            that.pay.wxpay(resdata);
          }else{
          wx.showModal({
            title: '警告',
            content: '服务器出错,支付失败',
            showCancel:false
          });
          reject(false);
        }
    })
  },
  // 卡片支付
  cardpay:function(e){
    var that    = this;
    //判断
    var changeres = that.changement();
    if (changeres=='error') {
      return;
    };
    //加入订单表
      that.ordermake().then(function(data){
          var orderid = data._id;
          var ordersn = data.sn;
          if(!isNaN(orderid)){
              that.setpayment.balance().then(function(data){
                var res = that.pay.paychange({cartdata:data,amount:that.data.cart.total});
                // 判断银行卡支付方式
                if(res=='amount_free') {
                  var amountdata  = that.pay.card_amount_free({amount:that.data.cart.total,orderid:ordersn});
                };
                if (res=='amount') {
                  var amountdata = that.pay.card_amount({amount:that.data.cart.total,orderid:ordersn});
                };
                if(res=='defeated'){
                  that.setData({'disabled':''});
                  wx.showModal({
                    title: '警告',
                    content: '余额不足,请充值',
                  });
                  return;
                };
                return amountdata;
              }).then(function(data){
                
                  that.orderlast(orderid);
                  return;
              
              }).catch(function(data){
                  console.log(data);
              })
          }else{
            that.setData({'disabled':''});
            wx.showModal({
              title: '警告',
              content: '服务器出错,支付失败',
              showCancel:false
            });
            return false;
          }
      })
  },
  // 加入订单
  ordermake:function(e){

    var that    = this;
    var order = app.xpm.require('Table','order');
    return  new _P(function (resolve, reject){
      order.create({
              sn:that.setpayment.genSN(), 
              uid:that.data._id,
              goods:that.utils.cart.get(),
              contact:that.data.nickName,
              address:that.data.address,
              mobile:that.data.mobile,
              status:'WAIT_PAY',
              status_tips:'',
              remark:''
        }).then(function(data){
            resolve(data);
        }).catch(function(data){
            reject(data);
        })
    })
  },
  // 成功支付后修改状态
  orderlast:function(id){
      var that    = this;
      var order = app.xpm.require('Table','order');
      order.query()
      .where('_id', '=', id)
      .fetch('*').then(function(data){
          if (data['0'].status=='PENDING') {
              var _id = data['0']._id;
              that.utils.cart.clean();
              wx.redirectTo({url:'/pages/store/order/detail/detail?id='+_id})
          };
      })
  },
  // 表单判断
  changement:function(){
    var that    = this;
    that.setData({'disabled':'disabled'});
    // 如果余额不够时候
    if(that.data.type=='cardpay'){
    // 价格当前
      var show_price = that.data.cart.show_price*100;
          //对价格进行处理
          that.setpayment.balance().then(function(data){
              var res =  {cartdata:{
                amount_free:data.amount_free,
                amount:data.amount
                },
                amount:show_price
              }
              return that.pay.paychange(res);
        }).then(function(data){
          if (data=='defeated'){
              that.setData({'disabled':''});
              wx.showModal({
                    title: '警告',
                    content: '余额不足,请及时充值'
                })
              return 'error';
            };
        })
    }
    // 判断是否存在价格
    var sale_price = that.data.cart.sale_price;
    if (sale_price==null||sale_price==''||sale_price==undefined) {
        that.setData({'disabled':''});
        wx.showModal({
          title: '警告',
          content: '您还没没有购买商品',
          showCancel:false
        });
        return 'error';
    }
    // 判断电话
    if (that.data.mobile==null||that.data.mobile==''||that.data.mobile==undefined) {
        that.setData({'disabled':''});
        wx.showModal({
          title: '警告',
          content: '您还没有填写手机号',
          showCancel:false
        });
        return  'error';
    }
    if(that.data.address==null||that.data.address==''||that.data.address==undefined) {
        that.setData({'disabled':''});
        wx.showModal({
          title: '警告',
          content: '您还没有填写地址',
          showCancel:false
        });
        return  'error';
    }
    if(that.data.type=='changement') {
        that.setData({'disabled':''});
        wx.showModal({
          title: '警告',
          content: '您还没有选择支付方式',
          showCancel:false
        });
        return  'error';
    }
 },
  onLoad: function () {
      var that = this;
      var user = app.xpm.require('User');
      var table = app.xpm.require('Table','goods');
      var tableuser = app.xpm.require('Table','user');
      var stor = app.xpm.require('Stor');
      var session = app.xpm.require('session');
      user.login().then(function( userInfo ){
          that.setpayment   = new Payment(userInfo._id,app.session);
          that.setpayment.balance().then(function(data){
            that.setData({amount:data.total/100});
            that.setData({amountdata:data});
          })
          // 传入payment类
          that.utils = new Goods(userInfo,app.session);
          that.pay  = new pay(that.setpayment,that.utils);
          // 读取当前用户购物车
          that.setData({cart:that.utils.cart.total()});
          // 查询商品信息
          var goods = that.utils.cart.get();
          var gids = [];
          for( var idx in goods ){
            gids.push(idx);
          };
          table.query().where('_id','in', gids ) // 后端版本 1.0rc4以上  wherein support
              .fetch('*').then( function( data ) {
                data = that.utils.fliter( data );

                for (var idx in data){
                  var id = data[idx]['_id'];
                  goods[id] = app.utils.merge( goods[id], data[idx] );
                }
                that.setData({'goods':goods });
            });
            return userInfo._id;
       }).then(function(userid){
          tableuser.query().where('_id', '=', userid).fetch('*').then(function(data){
              // 设置默认地址
              that.setData({'_id':data['0']._id});
              that.setData({'address':data['0'].addr_01});
              that.setData({'nickName':data['0'].nickName});
              that.setData({'mobile':data['0'].mobile});
          })
      }).catch( function( excp ){
          console.log(excp);
      });
  }
})