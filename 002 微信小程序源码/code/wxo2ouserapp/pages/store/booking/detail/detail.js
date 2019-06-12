var order = require("../../../../utils/order.js");
var pay = require("../../../../utils/pay.js");
var app = getApp();
var _P = app.xpm.getPromise();

//获取应用实例
Page({
  data: {
    start:'1900-01-01',
    end:'2999-12-12',
    starttime:'00:00',
    endtime:'24:00',
    index:0
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
  // 提交函数
  formSubmit: function(e) {
    var that   = this;
    if(that.data.title==''||that.data.title==undefined||that.data.title==null){
      wx.showModal({
        title: '警告',
        content: '对不起,您还没有选择服务项目',
        showCancel:false
      })
      return
    }
    if(e.detail.value.date==''||e.detail.value.date==undefined||e.detail.value.date==null){
     wx.showModal({
        title: '警告',
        content: '对不起,日期没有选择',
        showCancel:false
      })
      return
    }
    if(e.detail.value.time==''||e.detail.value.time==undefined||e.detail.value.time==null){
      wx.showModal({
        title: '警告',
        content: '对不起,时间没有选择',
        showCancel:false
      })
      return
    }; 
    // 用户id
    var userid = that.pay.userdata();
    var booking = app.xpm.require('Table','booking');
    userid.then(function(data){
      var num  = e.detail.value.goods;
      var datanum = that.data.arrid[num];
      booking.query()
            .where('status', '=', 'WAIT_CFM')
            .limit(1) 
            .fetch('_id').then(function(data) {
                if(data.length=='1'){
                      wx.showModal({
                          title: '警告',
                          content: '对不起,您还又没有处理的预定',
                          showCancel:false
                      })
                      return

                };

            })
      booking.create({sn:that.pay.randomnum(),
             uid:data['0']._id,
             goods:[datanum],
             when:e.detail.value.date+' '+e.detail.value.time,
             status:'WAIT_CFM',
             status_tips:'',
             remark:e.detail.value.remark
            }).then(function(data){
              wx.redirectTo({
                url:'/pages/store/booking/form/form?id='+data._id
              });
            }).catch( function( excp ) {
                console.log(excp);
            })
    })
  },
  // 设置服务
  service:function(e){
    var that   = this;
    var index = e.detail.value;
    that.setData({title:that.data.data[index]});
  },
  // 设置时间
  day:function(e){
    var that   = this;
    var index = e.detail.value;
    that.setData({start:index});
  },
  // 设置日期
  time:function(e){
    var that   = this;
    var index = e.detail.value;
    that.setData({starttime:index});
  },
  onLoad: function (e){
      var that   = this;
      that.pay = new pay();
      // 查询预约表
      var booking = app.xpm.require('Table','booking');
      that.pay.userdata().then(function(data){
          var id = data['0']._id;
          booking.query()
          .where('status', '=', 'WAIT_CFM')
          .where('uid', '=',id)
          .limit(1)
          .fetch('*').then(function(data){
              if (data.length=='1') {
                      wx.redirectTo({
                        url:'/pages/store/booking/form/form?id='+data['0']._id
                      });
                };
          })
      })
      that.order = new order();
      // 获取当前时间
      var myDate = new Date();
      // 设置当前时间结束
      var hours = myDate.getHours().toString();
      var minutes = myDate.getMinutes().toString();
      if ( hours.length ==  1 )   hours = '0'+hours;
      if ( minutes.length ==  1 )   minutes = '0'+minutes;
      var day = myDate.getFullYear()+'-'+myDate.getMonth()+1+'-'+myDate.getDate();
      var time = hours+':'+minutes;
      that.setData({start:day});
      that.setData({starttime:time});
      // 时间设置结束
      that.order.product().then(function(data){
        // 对数据进行数组处理
        var arr = [];
        var arrid = [];
        for (var i = 0; i < data.data.length; i++) {
          arrid.push(data.data[i]._id);
          arr.push(data.data[i].name);
        }
        that.setData({arrid:arrid});
        that.setData({data:arr});
        // 当前显示
        that.setData({title:arr['0']});
        if(e.id!=undefined){
            booking.query()
            .where('_id', '=',e.id)
            .limit(1)
            .fetch('*').then(function(data){
                for(var i = 0; i < that.data.arrid.length; i++){
                      if(that.data.arrid[i]==data['0'].goods['0']){
                        that.setData({index:i});
                        that.setData({title:that.data.data[i]});
                      };
                };
              // 时间处理
              var when = new Date(data['0'].when);
              var m = (when.getMonth() + 1).toString();
              var h = when.getHours().toString();
              var d = when.getDate().toString();
              var min= when.getMinutes().toString();
              if ( m.length ==  1 ) m = '0'+m;
              if ( min.length ==  1 ) min = '0'+min;
              if ( h.length ==  1 ) h = '0' + h;
              if ( d.length ==  1 ) d = '0' + d;
              var day  =  when.getFullYear() +'-'+ m + '-' + d;
              var time = h + ':' + min;
              that.setData({start:day});
              that.setData({starttime:time});
              that.setData({remark:data['0'].remark});
              // 时间处理结束
            })
        };
      }).catch( function( excp ) {
            console.log(excp);
      })
    }
})