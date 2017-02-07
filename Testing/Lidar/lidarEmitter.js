//Initialize Batman Subscriber using correct subnet
//var Publisher = require('cote')({'broadcast':'10.0.255.255'}).Publisher;
var Publisher = require('cote').Publisher;

var Subscriber = require('cote').Subscriber;
//var Subscriber = require('cote')({'broadcast': '10.0.255.255'}).Subscriber;

const RPLidar = require('rplidar');
const lidar = new RPLidar(path= '/dev/ttyUSB0');

var ready = 0;
var testing = 0;
var robotName = "Lidar 1";

var readline = require('readline');
var current = new Date();
var logfile_name = './logs/log-' + current.getFullYear() + "-"+ current.getMonth() + "-" + current.getDay()+ "-" + current.getHours()+ "-" + current.getMinutes() +'.txt'
var fs = require('fs')
var logger = fs.createWriteStream(logfile_name, {
  flags: 'a' // 'a' means appending (old data will be preserved)
})
logger.write("Lidar Network Log ("+current.toUTCString()+")"); //append header to log
logger.write('\r\n'); //new line

// Instantiate a new Publisher component.
var randomPublisher = new Publisher({
    name: robotName,
    // namespace: 'rnd',
    broadcasts: ['lidarUpdate']
});

// Wait for the publisher to find an open port and listen on it.
randomPublisher.on('ready', function() {
    ready =1;
});

var randomSubscriber = new Subscriber({
    name: robotName,
    // namespace: 'rnd',
    subscribesTo: ['commands']
});

randomSubscriber.on('commands', function(req) {
  console.log(req);
	switch (req) {
		case 0:
			testing = 0;
      lidar.stopScan();
			console.log('Stopping Scan...');
      break;
		case 1:
			testing = 1;
      lidar.scan();
			console.log('Resuming Scan...');
      break;
	}
});

lidar.init().then(() => {
    return lidar.getHealth();
}).then(health => {
    console.log('health: ', health);

    return lidar.getInfo();
}).then(info => {
    console.log('info: ', info);
}).then(() => {
    lidar.scan();
});

lidar.on('data', listener3 = function (data) {
  if(testing==1){
    var req = data;
    var date = new Date();
    req["name"] = robotName;
    req["latency"] = date.getTime();
    randomPublisher.publish('lidarUpdate', req);
    var reqLog = JSON.stringify(req); // '{"name":"binchen"}'
    logger.write(reqLog); //append to log
    logger.write('\r\n'); //new line
  }
  });

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    lidar.stopScan();
    process.exit();
});
