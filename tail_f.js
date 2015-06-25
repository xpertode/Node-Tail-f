var fs = require('fs')
var url = require('url')
var http = require('http')
var logFile = './log.txt'
var ajaxFile = './ajax.txt'


filestats = fs.statSync(logFile)
var curr_size = filestats["size"]
var prev_size = 0
var change = ''

function watch(filename,callback){
	watcher = fs.watch(filename);
	watcher.on('change',callback);
}

function fileSize(filename){
	filestats = fs.statSync(logFile)
    return filestats["size"]
}

function diff(eve,filename,callback){
    curr_size = fileSize(filename)
    var readstream = fs.createReadStream(logFile,{start:prev_size,end:curr_size})
	readstream.on('data',function(data){
		change = data.toString()
	});
	
	readstream.on('error',function(err){
		console.error(err)
	});
	
    readstream.on('end',function(){
		prev_size = curr_size;
	  callback
    });
	
}

var server = http.createServer(function(req,res){
  console.log('Server listening on localhost:2323')
  parseUrl = url.parse(req.url,true) 
    if(parseUrl.pathname === "/"){
	  readstream = fs.createReadStream(logFile);
	  readstream.on("data", function(data){
	  	 change += data.toString();
	    });
	  readstream.on('end',function(){
	  	prev_size = fileSize(logFile)
	  })
      var script = ''
      scriptstream = fs.createReadStream(ajaxFile);
      scriptstream.on("data", function(data){
        script += data;
      })
      scriptstream.on("end", function(){
        res.end(script);
      })
  }
  else if(parseUrl.pathname === '/log') {
	  	watch(logFile,diff);
		res.write(change.replace(/\n/gi, "<br>"))
		change='';
  	    res.end();
  }
  else
	  res.end("404 Not Found")
})
server.listen(2323)
