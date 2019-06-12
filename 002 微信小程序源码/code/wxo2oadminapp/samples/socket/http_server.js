var net = require('net');
var HOST = '0.0.0.0';  // Socket Bind IP Adress
var PORT = 10086;        // 端口号

// 创建一个 server 对象
var se = net.createServer( function(socket) {  //  创建成功后 回调

    console.log('已连接: ' + socket.remoteAddress + ':' + socket.remotePort );  // 已经连接
    
    socket.on('data', function(data) {   // 接收到客户端的指令运行
        
        var str = data.toString();
            str = str.replace('/\r/\n/gi', str);

        var lines = str.toString().split("\n");   // 分析处理客户端指令集
        var params = lines[0].split(' ');
        var cmd = params[0];
        var responseHeader = [];

        if ( cmd == 'GET' ) { // 处理 GET 请求
            var path = params[1] || '/';

            var responseBody = `
                <!DOCTYPE html>
                <html lang='zh-CN'>
                    <head>
                        <meta charset='utf-8'>
                        <style> 
                            h2 { font-size:24px; }
                            body { font-size:18px; }
                        </style>
                    </head>
                    <title>服务器</title>
                    <body>
                        <h2> 我的服务器 </h2>
                        <p> 
                            <strong> It Works! 你请求的地址:  ` + path +`  </strong>  
                        
                            <a href="`+path+`"> 我是一个连接 </a>
                        </p>
                    </body>
                    </html>
            `;  // 请求 Body
           
            // HTTP Response Header 
            responseHeader.push('HTTP/1.1 200 OK' );  
            responseHeader.push('Server: iserver/0.0.1');
            responseHeader.push('Content-Type: text/html');
            responseHeader.push('Content-Length: '+ responseBody.length);
            responseHeader.push('Accept-Ranges: bytes');

            console.log( '\t', params.join(' ') );

            // 应答
            socket.end( responseHeader.join('\r\n') + '\r\n' + responseBody  );

        } else {
            responseHeader.push( 'HTTP/1.1 404 Not Found\r\n' );
            socket.end( responseHeader.join( '\r\n') );
        }

    });

});

se.listen(PORT, HOST);  // 监听 HOST:PORT
console.log('Server ON', ' HOST:', HOST, ' PORT:', PORT );