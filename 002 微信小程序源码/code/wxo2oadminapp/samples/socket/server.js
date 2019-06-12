var net = require('net');
var HOST = '127.0.0.1';
var PORT = 10086;

var se = net.createServer( function(socket) {
    console.log('已连接: ' + socket.remoteAddress + ':' + socket.remotePort );
    socket.write( ':');
  
    socket.on('data', function(data) {
        
        var str = data.toString();
            str = str.replace('/\r/\n/gi', str);

        var lines = str.toString().split("\n");
        
        for ( var i in lines ) {
            var msg = lines[i];
                msg = msg.trim().toString();

            if ( msg == '' ) {
                break;
            }

            console.log('接收到的消息: FROM:' + socket.remoteAddress + ' Message:' + msg);

            if ( msg == 'quit') {
                console.log('运行退出指令: ' + msg );            
                socket.end('退出成功\n\r');
            } else {
                socket.write('应答: 你的发送的是 "' + msg + '"\n\r:');
            }
        }

    });

    socket.on('close', function(data) {
        console.log('连接已断开: ' + socket.remoteAddress + ' ' + socket.remotePort);
    });
});

se.listen(PORT, HOST);










