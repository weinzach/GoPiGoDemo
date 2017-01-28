//Initialize Batman Subscriber using correct subnet

//var Publisher = require('cote')({'broadcast':'10.0.255.255'}).Publisher;
var Publisher = require('cote').Publisher;

var Subscriber = require('cote').Subscriber;
//var Subscriber = require('cote')({'broadcast': '10.0.255.255'}).Subscriber;

var coteList = [];

var ready = 0;
var stdin = process.openStdin();

var readline = require('readline');
var current = new Date();
var logfile_name = './logs/log-' + current.getFullYear() + "-"+ current.getMonth() + "-" + current.getDay()+ "-" + current.getHours()+ "-" + current.getMinutes() +'.txt'
var fs = require('fs')
var logger = fs.createWriteStream(logfile_name, {
  flags: 'a' // 'a' means appending (old data will be preserved)
})
logger.write("Encoder Network Log ("+current.toUTCString()+")"); //append header to log
logger.write('\r\n'); //new line

var randomSubscriber = new Subscriber({
    name: 'LogServer',
    // namespace: 'rnd',
    subscribesTo: ['encUpdate']
});

// Instantiate a new Publisher component.
var randomPublisher = new Publisher({
    name: 'LogServer',
    // namespace: 'rnd',
    broadcasts: ['commands']
});

randomSubscriber.on('encUpdate', function(req) {
    var data = req.split(",");
    let ping = new Date(parseInt(data[0]));
    let latency = Date.now() - ping;
    data = data[0]+","+latency+","+data[1]+","+data[2]+","+data[3];
    console.log('RECIEVED:', data);
    logger.write(data); //append to log
    logger.write('\r\n'); //new line
});

function coteMembers() {
    setTimeout(function () {
        var ids = Object.keys(randomSubscriber.discovery.nodes);
	coteList = [];
	let status = 0;
	for (i = 0; i < ids.length; i++) {
    		coteList.push(randomSubscriber.discovery.nodes[ids[i]].advertisement.name);
	}
        coteMembers();
    }, 500);
}

stdin.addListener("data", function(d) {
	switch (d.toString().trim()) {
		case '0':
			randomPublisher.publish('commands', 0);
      break;
		case '1':
			randomPublisher.publish('commands', 1);
      break;
	}
});

process.on('SIGINT', function() {
    console.log("Ending Test....");
    randomPublisher.publish('commands', 0);
    process.exit();
});
