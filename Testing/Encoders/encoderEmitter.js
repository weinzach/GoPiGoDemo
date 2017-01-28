var robotName = "Sparky";

var arg = process.argv.slice(2)[0];
if(arg!=""){
  robotName = arg;
}

var Gopigo   = require('./libs').Gopigo;
var Commands = Gopigo.commands;
var Robot = Gopigo.robot;
var robot;

var ready = 0;
var testing = 0;

var readline = require('readline');
var now = new Date();
var logfile_name = './logs/log-' + now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDay()+ "-" + now.getHours()+ "-" + now.getMinutes() +'.txt'
var fs = require('fs')
var logger = fs.createWriteStream(logfile_name, {
  flags: 'a' // 'a' means appending (old data will be preserved)
})
logger.write("Encoder Log ("+now.toUTCString()+")"); //append header to log
logger.write('\r\n'); //new line

//Initialize Batman Subscriber using correct subnet

//var Publisher = require('cote')({'broadcast':'10.0.255.255'}).Publisher;
var Publisher = require('cote').Publisher;

var Subscriber = require('cote').Subscriber;
//var Subscriber = require('cote')({'broadcast': '10.0.255.255'}).Subscriber;

var ultrasonicPin = 15;

var rl = readline.createInterface({
  input : process.stdin,
  output: process.stdout
});

robot = new Robot({
  minVoltage: 5.5,
  criticalVoltage: 1.2,
  debug: true,
  ultrasonicSensorPin: ultrasonicPin,
})

robot.on('init', function onInit(res) {
  if (res) {
    console.log('GoPiGo Ready!');
    console.log('Starting Logging...');
    ready = 1;
  } else {
    console.log('Something went wrong during the init.')
  }
})
robot.on('error', function onError(err) {
  console.log('Something went wrong')
  console.log(err)
})
robot.on('free', function onFree() {
  console.log('GoPiGo is free to go')
})
robot.on('halt', function onHalt() {
  console.log('GoPiGo is halted')
})
robot.on('close', function onClose() {
  console.log('GoPiGo is going to sleep')
})
robot.on('reset', function onReset() {
  console.log('GoPiGo is resetting')
})
robot.on('normalVoltage', function onNormalVoltage(voltage) {
  console.log('Voltage is ok ['+voltage+']')
})
robot.on('lowVoltage', function onLowVoltage(voltage) {
  console.log('(!!) Voltage is low ['+voltage+']')
})
robot.on('criticalVoltage', function onCriticalVoltage(voltage) {
  console.log('(!!!) Voltage is critical ['+voltage+']')
})
robot.init();

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
      var res = robot.motion.stop();
			console.log('Stopping:' + res);
      break;
		case 1:
			testing = 1;
			var res = robot.motion.forward(false);
			console.log('Moving forward:' + res);
      break;
	}
});


// Instantiate a new Publisher component.
var randomPublisher = new Publisher({
    name: robotName,
    // namespace: 'rnd',
    broadcasts: ['encUpdate']
});

// Wait for the publisher to find an open port and listen on it.
randomPublisher.on('ready', function() {
    setInterval(function() {
    if((ready==1)&&(testing==1)){
        var date = new Date();
	var time = date.getTime();
 	var res1 = robot.encoders.read(0);
	var res2 = robot.encoders.read(1);
	var val = time+","+robotName+","+res1+ ","+ res2;
    	console.log(val);
	logger.write(val); //append to log
	logger.write('\r\n'); //new line
        // publish an event with arbitrary data at any time
        randomPublisher.publish('encUpdate', val);
	}
}, 500);
});

process.on('SIGINT', function() {
    console.log("Ending Test....");
    var res = robot.motion.stop()
    console.log('Stopping:' + res);
    process.exit();
});
