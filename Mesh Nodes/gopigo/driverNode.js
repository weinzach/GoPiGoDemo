//Module dependencies.
var messenger = require('messenger');
var config = require("./nodeConfig.json");

server = messenger.createListener(8001);

var Gopigo = require('./libs').Gopigo;
var Commands = Gopigo.commands;
var Robot = Gopigo.robot;
var robot;
var ready = 0;
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
        ready = 2;
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

var LeftLedStat = false;
var RightLedStat = false;
var robotState = 0;

function updateRobot(clientMessage) {
    robotData.name = config.node_name;
    robotData.type = config.robot_type;
    robotData.packet = 'info';
    var nodeData = {'leftLed': LeftLedStat,'rightLed': RightLedStat, 'robotState': robotState};
    robotData.data = [nodeData];
    clientMessage.reply(robotData);
}

function handleAnswer(answer,clientMessage) {
    var message = ''
    switch (answer) {
        case 'reset':
            robot.reset()
            break
        case 'left led on':
            var res = robot.ledLeft.on();
            console.log('Left led on::' + res);
            LeftLedStat = true;
            break;
        case 'left led off':
            var res = robot.ledLeft.off();
            console.log('Left led off::' + res);
            LeftLedStat = false;
            break;
        case 'right led on':
            var res = robot.ledRight.on();
            console.log('Right led on::' + res);
            RightLedStat = true;
            break;
        case 'right led off':
            var res = robot.ledRight.off();
            console.log('Right led off::' + res);
            RightLedStat = false;
            break;
        case 'w':
            var res = robot.motion.forward(false);
            console.log('Moving forward::' + res);
            robotState = 1;
            break;
        case 'a':
            var res = robot.motion.left();
            console.log('Turning left::' + res);
            robotState = 1;
            break;
        case 'd':
            var res = robot.motion.right();
            console.log('Turning right::' + res);
            robotState = 1;
            break;
        case 's':
            var res = robot.motion.backward(false);
            console.log('Moving backward::' + res);
            robotState = 1;
            break;
        case 'stop':
            var res = robot.motion.stop();
            console.log('Stop::' + res);
            robotState = 0;
            break;
        case 'x':
            var res = robot.motion.stop();
            console.log('Stop::' + res);
            robotState = 0;
            break;
    }
    updateRobot(clientMessage);
    ready = 1;
}

server.on('drive', function(message, data){
  if (ready = 1) {
      ready = 0;
      handleAnswer(data.command,message)
  }
  message.reply({'status':'0'});
});
