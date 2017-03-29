var Gopigo   = require('./libs').Gopigo;
var gpio = require('rpi-gpio');

var Commands = Gopigo.commands;
var Robot = Gopigo.robot;
var robot;
var ready = 0;

var ultrasonicPin = 15;
//var irreceiverPin = 8

robot = new Robot({
  minVoltage: 5.5,
  criticalVoltage: 1.2,
  debug: true,
  ultrasonicSensorPin: ultrasonicPin,
  //IRReceiverSensorPin: irreceiverPin
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
  console.log('Voltage is ok ['+voltage+']')
})
robot.on('lowVoltage', function onLowVoltage(voltage) {
  console.log('(!!) Voltage is low ['+voltage+']')
})
robot.on('criticalVoltage', function onCriticalVoltage(voltage) {
  console.log('(!!!) Voltage is critical ['+voltage+']')
})
robot.init()

function init(){
  robot.encoders.targeting(0, 0, 0);
  getSensors();
}

function getSensors() {
    setTimeout(function () {
      if(ready==1){
        console.log(robot.ledLeft);
        console.log(robot.encoders.read(0)+" "+robot.encoders.read(1));
      }
        getSensors();
    }, 500);
}

init();
