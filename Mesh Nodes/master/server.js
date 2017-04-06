var config = require("./nodeConfig.json");
var ready = 0;

if (config.batman == true) {
    var Subscriber = require('cote')({
        'broadcast': '10.0.255.255'
    }).Subscriber;
    var Publisher = require('cote')({
        'broadcast': '10.0.255.255'
    }).Publisher;
} else {
    var Publisher = require('cote').Publisher;
    var Subscriber = require('cote').Subscriber;
}

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ejs = require('ejs');
var coteList = [];
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Instantiate a new Publisher component.
var randomPublisher = new Publisher({
    name: config.node_name,
    broadcasts: ['drive']
});

// Wait for the publisher to find an open port and listen on it.
randomPublisher.on('ready', function() {
    ready = 1;
});

var robotSubscriber = new Subscriber({
    name: config.node_name+"-Sub",
    // namespace: 'rnd',
    subscribesTo: ['robotData']
});

robotSubscriber.on('robotData', function(req) {
    io.sockets.emit('robotData', req);
});

app.get('/', function(req, res) {
    res.sendfile('views/index.html');
});

app.get('/lidar/:id', function(req, res) {
    var id = req.params.id;
    res.render('lidar', {name:id});
});

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('message', function(msg, socket) {
        var botname = msg.bot.toLowerCase();
        var data = {"name": botname,"command": msg.command};
        if (isOnline(botname, socket) == 1) {
            io.emit('message', {
                online: '1'
            });
        } else {
            io.emit('message', {
                online: '0'
            });
        }
        console.log("Command : " + data.command +"("+data.name+")");
        if (ready = 1) {
            randomPublisher.publish("drive", data);
        }
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

function isOnline(bot, socket) {
    for (i = 0; i < coteList.length; i++) {
        if (coteList[i].toLowerCase() == bot) {
            return 1;
        }
    }
    return 0;
}

function coteMembers() {
    setTimeout(function() {
        var ids = Object.keys(randomPublisher.discovery.nodes);
        coteList = [];
        let status = 0;
        for (i = 0; i < ids.length; i++) {
            coteList.push(randomPublisher.discovery.nodes[ids[i]].advertisement.name);
        }
        coteMembers();
    }, 500);
}

coteMembers();
