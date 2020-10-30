var net = require('net');
var fs = require('fs');
var points=null;
var answer=null;
var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
        r = data.toString();
        if(r.substring(0,3)=="GET" & r.length<=600) {  // if GET only
            console.log("You did GET");
            console.log(points);
            socket.write("HTTP/1.1 200 OK\n");
            socket.write("Access-Control-Allow-Origin: *\n");
            answer=JSON.stringify(points);
            socket.write("Content-Length:"+answer.length);
            socket.write("\n\n");
            socket.write(answer);
        }
        else if (r.substring(0,4)=="POST" & r.length<=600){
           console.log("You have POSTED the following");
            var curlybracket = r.indexOf("{");
            var points_data = r.substring(curlybracket, r.length);
            points = JSON.parse(points_data);
            console.log(points);
        }
        else console.log(r); // show the actual message
    });  
    socket.on('close', function() {
        console.log('Connection closed');
    });
    socket.on('end', function() {
        console.log('client disconnected');
     });

    socket.on('error', function() {
        console.log('client disconnected');
     });
});
server.listen(8080, function() { 
    console.log('server is listening on port 8080');
});
