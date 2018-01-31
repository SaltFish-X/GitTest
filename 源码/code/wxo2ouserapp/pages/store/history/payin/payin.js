//获取应用实例
var pay = require("../../../../utils/pay.js");
var app = getApp();
var _P = app.xpm.getPromise();

Page({
  data: {
    testsis:'/res/icons/testsis.jpg'
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
  onLoad: function (){
    var that = this;
    that.pay  = new pay();
    var income = app.xpm.require('Table','income');
    that.pay.userdata().then(function(data){
        income.query()
        .where('uid', '=', data['0']._id)
        .where('status', '=', 'DONE')
        .fetch('*').then(function(data) { 
            that.setData({data:data});
        })
    })
  }
})