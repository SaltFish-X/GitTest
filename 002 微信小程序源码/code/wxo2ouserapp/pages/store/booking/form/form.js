//获取应用实例
var pay = require("../../../../utils/pay.js");
var app = getApp();
var _P = app.xpm.getPromise();
Page({
  data: {
    index:'/pages/store/user/user/user',
    
  },

  linkto: function( e ) {
    var data = e.currentTarget.dataset;
    var link = data.link || '/pages/index/index';
    console.log(link);
    if ( link != '/pages/404/404') {
      wx.navigateTo({ url: link });
    }
  },

  seturl: function(e) {
    var mystar = new Array();
    var thisnum = e.currentTarget.dataset.num; 
    // 循环新数组
    for(var i=0;i<=thisnum;i++) {
        var obj = {};
        obj['start.'+i+'.num'] = i+Number(1);
        obj['start.'+i+'.link'] = '/res/icons/start.png'
        console.log(this.data.start);
        this.setData(obj);
    };
 },
  black:function(e){
     wx.navigateTo({ url:'/pages/store/user/user/user'});
  },
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function(e) {
    this.setData({
      time: e.detail.value
    })
  },
  begin:function(e){
    var that = this;
    var booking = app.xpm.require('Table', 'booking');
    var id = that.data.data._id;
    booking.update(id,{status:'WAIT_CFM'})
           .then(function(data){
              if (id!=""||id!=null||id!=undefined){
                    wx.navigateBack({
                        url:'/pages/store/booking/detail/detail?id='+id
                    });
                };
            }).catch(function( excp ){
              reject(excp);
           });
  },
  //取消预约
  cancel:function(e){
    var that = this;
    var booking = app.xpm.require('Table', 'booking');
    var id = that.data.data._id;
    booking.update(id,{status:'FAIL'})
           .then(function(data){
              if (id!=""||id!=null||id!=undefined) {
                    wx.navigateBack({
                        url:'/pages/store/user/user/user'
                    });
                };
            }).catch(function( excp ){
              reject(excp);
           });
  },
  onLoad: function (e){ 
  var that = this;
    // 生成随机数
  that.pay = new pay();
    // 用户id
   that.pay.userdata().then(function(data){
      // 查询
      var table = app.xpm.require('Table', 'income');
      var booking = app.xpm.require('Table', 'booking');
      var  goods= app.xpm.require('Table', 'goods');
      booking.query()
          .where('_id','=',e.id)
          .where('uid','=',data['0']._id)
          .fetch('*').then(function(data) {
              that.setData({'data':data['0']}); 
              return data;
          }).then(function(data){
              if(data['0']==undefined||data['0']==''||data['0']==null){
                  return;
              };
              goods.query()
                  .where('_id','=',data['0'].goods['0'])
                  .fetch('*').then(function(data) {  
                    that.setData({'res':data['0']});
                  })
          }).catch(function( excp ){
            console.log(excp);
          });
    }).catch(function( excp ){
         console.log(excp);
    })
  }
})