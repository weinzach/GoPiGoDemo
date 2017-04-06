//Module dependencies.
var messenger = require('messenger');
var config = require("./nodeConfig.json");
var zerorpc = require("zerorpc");

server = messenger.createListener(8000);
client = messenger.createSpeaker(8001);

var ready = 0;
var stopped = 0;

if (config.batman == true) {
    var Publisher = require('cote')({
        'broadcast': '10.0.255.255'
    }).Publisher;
    var Subscriber = require('cote')({
        'broadcast': '10.0.255.255'
    }).Subscriber;
} else {
    var Publisher = require('cote').Publisher;
    var Subscriber = require('cote').Subscriber;
}

// Instantiate a new Publisher component.
var robotPublisher = new Publisher({
    name: config.node_name + '-Pub',
    broadcasts: ['robotData']
});
var robotSubscriber = new Subscriber({
    name: config.node_name,
    subscribesTo: ["drive"]
});

// Wait for the publisher to find an open port and listen on it.
robotPublisher.on('ready', function() {
    ready = 1;
});

//Waiting for LiDAR data
var zerorServer = new zerorpc.Server({
    sendData: function(data, reply) {
        var responce = JSON.parse(data.toString("utf8"));
        responce.time = Date.now();
        robotPublisher.publish('robotData', responce);
        reply(null, "{'status':0}");
    }
});
zerorServer.bind("tcp://0.0.0.0:8002");

//Waiting For Encoder Data
server.on('encoders', function(message, data) {
    if (ready == 1) {
        data.time = Date.now();
        robotPublisher.publish('robotData', data);
    }
    message.reply({
        'status': '0'
    });
});

//Waiting for Driving Commands
robotSubscriber.on('**', function(req) {
    if ((req.name == config.node_name) || (req.name == "*")) {
        client.request('drive', req, function(data) {
            data.time = Date.now();
            robotPublisher.publish('robotData', data);
        });
    }
});


function checkStatus() {
    setTimeout(function() {
        var ids = Object.keys(robotSubscriber.discovery.nodes);
        var coteList = [];
        let status = 0;
        for (i = 0; i < ids.length; i++) {
            coteList.push(robotSubscriber.discovery.nodes[ids[i]].advertisement.name);
        }
        for (i = 0; i < coteList.length; i++) {
            if (coteList[i] == "master") {
                status = 1;
            }
        }
        if (status == 0) {
          if(stopped==0){
            console.log("master is offline");
            var stopData = {name: config.node_name, command:'x'};
            client.request('drive', stopData, function(data) {
                console.log("Stopped Robot!");
            });
            stopped = 1;
          }
        }
        else{
          stopped = 0;
        }
        checkStatus();
    }, 100);
}
checkStatus();
