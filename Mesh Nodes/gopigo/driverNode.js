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


if (config.batman == true) {
    var Subscriber = require('cote')({
        'broadcast': '10.0.255.255'
    }).Subscriber;
} else {
    var Subscriber = require('cote').Subscriber;
}
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

function updateRobot() {
    robotData.name = config.node_name;
    robotData.type = config.robot_type;
    var nodeData = {'leftLed': LeftLedStat,'rightLed': RightLedStat, 'robotState': robotState};
    robotData.data = [nodeData];
    client.request('robotData', robotData, function(data) {
      console.log("Updating Robot Status...");
    });
}

function handleAnswer(answer) {
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
    updateRobot();
    ready = 1;
}

var batSubscriber = new Subscriber({
    name: config.node_name,
    subscribesTo: ["drive"]
});

batSubscriber.on('**', function(req) {
    if (ready = 1) {
        ready = 0;
        console.log(req);
        if(req.name==config.node_name){
          handleAnswer(req);
        }
    }
});

function checkStatus() {
    setTimeout(function() {
        var ids = Object.keys(batSubscriber.discovery.nodes);
        var coteList = [];
        let status = 0;
        for (i = 0; i < ids.length; i++) {
            coteList.push(batSubscriber.discovery.nodes[ids[i]].advertisement.name);
        }
        for (i = 0; i < coteList.length; i++) {
            if (coteList[i] == "master") {
                status = 1;
            }
        }
        if (status == 0) {
            if (ready != 0) {
                console.log("master is offline");
                var res = robot.motion.stop();
                console.log('Stop::' + res);
            }
            ready = 0;
        } else {
            ready = 1;
        }
        checkStatus();
    }, 100);
}
checkStatus();
