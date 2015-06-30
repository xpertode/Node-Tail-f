var fs = require('fs')
var url = require('url')
var http = require('http')
var watcher =require('on-file-change')
var logFile = './log.txt'
var indexFile = './index.html'

//Initialize Global variables
filestats = fs.statSync(logFile)
var curr_size = filestats["size"]
var prev_size = 0

function fileSize(filename){
	filestats = fs.statSync(logFile)
    return filestats["size"]
}
//Reads changes in log file
function diff(eve,filename){
	var log_diff=''
    curr_size = fileSize(filename)
    var readstream = fs.createReadStream(logFile,{start:prev_size,end:curr_size})
	readstream.on('data',function(data){
			log_diff += data.toString()
	});
	
	readstream.on('error',function(err){
		console.error(err)
	});
	
    readstream.on('end',function(){
		prev_size = curr_size;
		send(log_diff)
    });
}

var server = http.createServer(function(req,res){
  console.log('Server listening on localhost:2323')
  parseUrl = url.parse(req.url,true) 
    if(parseUrl.pathname === "/"){
      res.writeHead(200, {'Content-Type': 'text/html'});
	  var script = fs.readFileSync(indexFile)
	  res.write(script)
      res.end()
	 }
  else{
	  res.end("404 Not Found ")
	}	
	watcher(logFile,diff);
})

var io = require('socket.io')(server);
//Send the diff data
function send(data){
	io.emit('data',data.replace(/\n/gi, "<br>"))
	change = ''
};
	
server.listen(2323)
//Send complete logFile on new connection
io.on('connection',function(socket){
	socket.emit('logfile',fs.readFileSync(logFile).toString().replace(/\n/gi, "<br>"))
	prev_size = fileSize(logFile)
});


