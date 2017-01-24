var robotName = "Sparky";

var Gopigo   = require('./libs').Gopigo;
var Commands = Gopigo.commands;
var Robot = Gopigo.robot;
var robot;

var ready = 0;

var readline = require('readline');
var now = new Date();
var logfile_name = './log-' + now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDay()+ "-" + now.getHours()+ "-" + now.getMinutes() +'.txt'
var fs = require('fs')
var logger = fs.createWriteStream(logfile_name, {
  flags: 'a' // 'a' means appending (old data will be preserved)
})
logger.write("Encoder Log ("+now.toUTCString()+")"); //append header to log
logger.write('\r\n'); //new line

//Initialize Batman Subscriber using correct subnet
//var Publisher = require('cote')({'broadcast':'10.0.255.255'}).Publisher;
var Publisher = require('cote').Publisher;
var channels = ['encoders'];

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
    encoderLogger();
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

// Instantiate a new Publisher component.
var randomPublisher = new Publisher({
    name: robotName,
    // namespace: 'rnd',
    broadcasts: ['encUpdate']
});

// Wait for the publisher to find an open port and listen on it.
randomPublisher.on('ready', function() {
    setInterval(function() {
    if(ready==1){
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
    }, 1000);
});

function encoderLogger() {
	if(ready>1){
		var date = new Date();
		var time = date.getTime();
 		var res1 = robot.encoders.read(0);
		var res2 = robot.encoders.read(1);
    		console.log(time+","+res1+ ","+ res2);
		logger.write(time+","+res1+ ","+ res2); //append to log
		logger.write('\r\n'); //new line
	}
	setTimeout(encoderLogger, 1);
}
