var net = require('net');
var HOST = '127.0.0.1';
var PORT = 10086;

var client = new net.Socket();

client.on('data', function( data ){
	console.log( '服务端响应:' , data.toString() );
});

client.on('close', function() {
    console.log('连接已关闭');
});

client.connect(PORT, HOST, function() {

	client.write('HELLO\n\rquit\n\r', function(){
		console.log("指令发送成功");
	});

});
