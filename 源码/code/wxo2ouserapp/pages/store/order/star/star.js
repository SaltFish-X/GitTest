var payment   = require("../../../../utils/payment.js");
var app = getApp();
var _P = app.xpm.getPromise();
//获取应用实例
Page({
  data: {
    testsis:'/res/icons/testsis.jpg',
    testfour:'/res/icons/testfour.jpg',
    userInfo:'/res/icons/testsis.jpg',
    black:'/res/icons/black.jpg',
    size:'mini',
    numstart:6,
    show:'hide',
    start: [
        {num:'1',link:'/res/icons/start.png'},
        {num:'2',link:'/res/icons/start.png'},
        {num:'3',link:'/res/icons/start.png'},
        {num:'4',link:'/res/icons/start.png'},
        {num:'5',link:'/res/icons/start.png'}
      ]
  },
    /**
   * 读取订单数据
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  getOrder:function( id ) {
    this.id = id || null;
    var that = this;
    var status = {
      'WAIT_PAY':{name:'待付款', style:'text-warn', tpl:'wait_pay'},
      'WAIT_CFM':{name:'待确认', style:'text-warn', tpl:'wait_cfm'},
      'PENDING':{name:'配送中', style:'text-muted', tpl:'pending'},
      'DOING':{name:'服务中', style:'text-muted', tpl:'doing'},
      'WAIT_RWD':{name:'待评价', style:'text-primary', tpl:'wait_rwd'},
      'DONE':{name:'完成', style:'text-muted', tpl:'done'},
      'CANCEL':{name:'已取消', style:'text-muted', tpl:'done'}
    };
    
    return new _P( function( resolve, reject ) {
      if ( typeof id == 'undefined' ) {
        reject({code:404, message:'订单不存在', extra:{id:id}});
        return;
      }
      var order = {}, goods =[], user={};
      that.order = app.xpm.require('table', 'order'); 
      that.user = app.xpm.require('user','user'); 
      that.order.query()
        .where('_id', '=', id )
        .inWhere('goods', 'goods')
        .limit(1)
        .fetch('*')
        .then(function( resp ) {

        var order_data = resp[0];

        if ( app.utils.empty(order_data) ) {
          reject({'code':404, 'message':'订单不存在', 'extra':{id:id} });
          return;
        }

        var gids = [], order_price = 0;
        goods = order_data['goods'];
        
        for( var idx in goods ) {
          gids.push(idx);

          order_data['show_status'] = status[order_data.status];

          // 下单时的价格
          order_data['goods'][idx]['amount'] = order_data['goods'][idx]['amount'] || 1;
          var price=order_data['goods'][idx]['price'];
          var amount=order_data['goods'][idx]['amount'];
            order_price = order_price + ( new Number(price) * new Number(amount) );
            order_data['goods'][idx]['sale_price'] = price;
            order_data['goods'][idx]['show_price'] = (price/100).toFixed(2).toString();
            delete order_data['goods'][idx]['price'];
        }

        order_data['sale_price'] = order_price;
        order_data['show_price'] = (order_price/100).toFixed(2).toString();

        order = order_data;

        /*return that.goods.query().where('_id','in', gids ).fetch('*');
      })

      .then ( function( data ) { */

        var i = 0, data = order_data['goods'];
        for (var idx in data){
          var id = data[idx]['_id'];
          goods[id] = app.utils.merge(  data[idx],goods[id] );

          // 更新订单名称等信息
          if (i==0) {
            
            order['show_name'] = goods[id]['name'];
            order['corver'] = goods[id]['corver'];
            if ( typeof Object.keys == 'function' ) {
              if ( Object.keys(data).length > 1 ) {
                order['show_name'] = order['show_name'] + '等';
              }
            }
          }

          i++;
        }

        return that.user.tab.get(order['uid']);
      }).then ( function( userResp ) {
        resolve({goods:goods, order:order, user:userResp});
      })
      .catch( function( excp ) {
        reject(excp);
      })
    });
  },
  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },
  unpayout:function( e ) {
     wx.navigateTo({ url:'/pages/store/order/myorder/myorder'});
  },
  seturl: function(e) {
    var mystar = new Array();
    var that   = this;
    var thisnum = e.currentTarget.dataset.num-1;
    that.setData({numstart:thisnum+1});
    if (thisnum+1>=4){
      that.setData({show:'show'});  
    }else{
      that.setData({show:'hide'}); 
    }
    // 循环新数组
    for(var i=0;i<=4;i++) {
        var obj = {};
        if(i<=thisnum){
          obj['num']  = i+1;
          obj['link'] ='/res/icons/rstart.png';
          mystar[i] = obj
        }else{
          obj['num']  = i+1;
          obj['link'] ='/res/icons/start.png';
          mystar[i] = obj
       }
    };
    that.setData({start:mystar});
  },
  formSubmit:function(e){
    var total = e.detail.value.total;
    var reward = app.xpm.require('Table','reward');
    var order = app.xpm.require('Table','order');
    var that   = this;
    var id = that.data.id;
    // 生成随机数
    var random = that.payment.genSN();
    // 商品id
    var star = that.data.numstart;
    // 用户id
    var _id = that.data.user._id;
    if (star=='6') {
      wx.showModal({
        title: '提示',
        content: '对不起，您还没有评论',
        showCancel:false
      })
      return;
    };
    var totalnum = total*100;
    if(!isNaN(total)){
        // 判断有没有打赏金额
        if (total==''||total==null||total==undefined) {
            order.update(id,{star:star,status:'DONE',uid:_id}).then(function(data){
                 wx.navigateTo({ url:'/pages/store/order/detail/detail?id='+id});
            }).catch(function(data){
               console.log(data);
            });
        }else{
          var sn = that.data.order.sn;
          reward.create( 
              {order_sn:sn,amount:totalnum,status:'WAIT',uid:_id,sn:random}
          ).then(function(data){
              var _id = data._id;
              that.payment.incomeThenPayout({
                amount:totalnum,
                amount_free:0,
                option:{body:'打赏'}
              },{
                amount:totalnum,
                amount_free:0,
                 option:{
                   order_sn:sn,
                   order_status:'DONE'
                 }
              }).then( function( balance ){
                  reward.update(_id, {status:'success'});
                  wx.navigateTo({ url:'/pages/store/order/detail/detail?id='+id});
                  order.update(id,{star:star})
                  console.log( 'cash balance',  balance );
                }).catch( function(excp){
                  console.log( 'cash Excp Error', excp  );
              });
          })
        }
      }else{
      wx.showModal({
        title: '提示',
        content: '对不起，您输入的不为数字',
        showCancel:false
      })

    }
  },
  onLoad: function (e){
    var id =  e.id;
    var that   = this;
    that.setData({id:id});
    var user = app.xpm.require('User');
    user.login().then(function( userInfo ){
      that.payment =  new payment(userInfo._id,app.session);
      that.payment.balance().then(function(data){
        that.setData({amount:data.total});
        that.getOrder(id).then(function(data){
          that.setData({goods:data.goods});
          that.setData({order:data.order});
          that.setData({user:data.user});

        }).catch(function(data){
          console.log(data);
        })
      }).catch(function(data){
        console.log(data);
      })
    }).catch(function(data){
      console.log(data);
    })
  }
})