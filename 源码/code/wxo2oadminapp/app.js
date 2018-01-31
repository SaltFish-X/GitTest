
App({

  onLaunch: function () {

    var that = this;

    // 创建 xpm 对象
    this.xpm = require('xpmjs/xpm.js').option({
        'app':2,
        'host':'demo.xpmjs.com',
        'https':'demo.xpmjs.com',
        'wss': 'demo.xpmjs.com/ws-server',
        'table.prefix': 'demo',
        'user.table':'user'
    });
    
    // this.xpm = require('xpmjs/xpm.js').option({
    //     'host':'wxcloud.tuanduimao.cn',
    //     'https':'wxcloud.tuanduimao.cn',
    //     'wss': 'wxcloud.tuanduimao.cn/ws-server',
    //     'table.prefix': 'rc',
    //     'user.table':'user'
    // });
    

    // 创建全局对象
    this.wss = this.xpm.require('wss');  // 信道
    this.session = this.xpm.require('session');  // 会话
    this.stor = this.xpm.require('stor'); // 存储
    this.utils = this.xpm.require('utils'); // 工具
    this.user = this.xpm.require('user'); // 工具
    
    this.stor.clearSync();
    this.session.start();



    // 客户测 
    this.wss.listen('payment', function( res, status ){
      

      // 当接收到 payment 指令后运行 
      if ( status != 'success') return ;

      var params = res.request.b;
      var manager = res.response;
      var mid = manager['_id'] || null , oid = params['id']  || null;
      

      if (  mid == null ) {return; } 
      if ( oid == null ){
        app.wss.send('payment.answer', {code:502, message:'bad request'}, mid );
        return;
      }

      wx.navigateTo({ url: '/pages/store/order/detail/detail?id='+oid + '&mid='+mid });

    });
    
    this.user.login().then(function(){
        that.wss.open('/wxapp').then(function( resp ){
          // console.log( resp );
        })
        .catch( function(){
          // console.log( 'line error');
        })
    }).catch( function(resp){
          // console.log( 'line error', resp);
    })
    
  },
  xpm:null,
  utils:null,
  session:null,
  stor:null,
  wss:null
})