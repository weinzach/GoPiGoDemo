//Module dependencies.
var messenger = require('messenger');
var config = require("./nodeConfig.json");

client = messenger.createSpeaker(8000);

var Gopigo = require('./libs').Gopigo;
var Commands = Gopigo.commands;
var Robot = Gopigo.robot;
var robot;
var ready = 0;
var robotData = {};

var robotData = {};
var ultrasonicPin = 15;

robot = new Robot({
    minVoltage: 5.5,
    criticalVoltage: 1.2,
    debug: true,
    ultrasonicSensorPin: ultrasonicPin,
})
robot.on('init', function onInit(res) {
    if (res) {
        console.log('GoPiGo Ready!')
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
    console.log('Voltage is ok [' + voltage + ']')
})
robot.on('lowVoltage', function onLowVoltage(voltage) {
    console.log('(!!) Voltage is low [' + voltage + ']')
})
robot.on('criticalVoltage', function onCriticalVoltage(voltage) {
    console.log('(!!!) Voltage is critical [' + voltage + ']')
})
robot.init()

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

function getData() {
  if (ready==1) {
    robotData = {name: config.node_name, type:config.robot_type, packet:"encoders",data:[{}]};
    var encoderData = [];
    encoderData.push(robot.encoders.read(0));
    encoderData.push(robot.encoders.read(1));
    robotData.data[0].encoders = encoderData;
    client.request('encoders', robotData, function(data) {
      console.log("Emitted Data...");
    });
  }
    init();
}

//Check for DB Entry
function init() {
  setTimeout(function() {
    getData();
 }, 200);
}
init();
