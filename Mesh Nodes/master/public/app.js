var socket = io();
var active = 0;
var lled = 0;
var rled = 0;
var name = "Nichols";
var status = 0
var lidar = 0;

socket.on('connect', function() {
    document.getElementById("status").innerHTML = "Socket Status: Connected";
});
socket.on('disconnect', function() {
    document.getElementById("status").innerHTML = "Socket Status: Disconnected";
});

socket.on('message', function(data) {
    if (data.online) {
        if (data.online != status) {
            status = data.online;
            if (name != "*") {
                if (status == 0) {
                    document.getElementById('rlatency').style.display = "none";
                    document.getElementById('table-container').style.display = "none";
                    document.getElementById("robotstatus").innerHTML = '<h4 class="center red-text">' + name + ' is Offline</h4>';
                } else {
                    document.getElementById('rlatency').style.display = "block";
                    document.getElementById('table-container').style.display = "block";
                    document.getElementById("robotstatus").innerHTML = '<h4 class="center green-text">' + name + ' is Online</h4>';
                }
            } else {
                document.getElementById('rlatency').style.display = "none";
                document.getElementById('table-container').style.display = "none";
                document.getElementById("robotstatus").innerHTML = '<h4 class="center green-text">Connected to ALL Active Robots</h4>';
            }
        }
    }
});

function updateTable(data) {
    var latency = Date.now() - data.time;
    var latencyString = "Data Latency: " + Math.abs(latency) + "ms";
    document.getElementById("rlatency").innerHTML = latencyString;
    document.getElementById("rname").innerHTML = data.name;
    if (data.type == "") {
        document.getElementById("rtype").innerHTML = "N/A";
    } else {
        document.getElementById("rtype").innerHTML = data.type;
    }
    if (data.type == "gopigo") {
        if (data.packet == "info") {
            document.getElementById("rstatus").innerHTML = data.data[0].robotState;
            document.getElementById("rrled").innerHTML = data.data[0].rightLed;
            document.getElementById("rlled").innerHTML = data.data[0].leftLed;
        }
        if (data.packet == "encoders") {
            document.getElementById("rrencoder").innerHTML = data.data[0].encoders[0];
            document.getElementById("rlencoder").innerHTML = data.data[0].encoders[1];
        }
    }
}

function updateLidar(data) {
  var xs = [];
  var ys = [];
  var zs = [];
  for (i = 0; i < data.length; i++) {
    dataArray = data[i].split(" ");
    var angle = dataArray[0];
    var dist = dataArray[1];
    xs.push(Math.cos(angle)*dist);
    ys.push(Math.sin(angle)*dist);
    zs.push(10);
  }


    var trace1 = {
    	x:xs, y: ys, z: zs,
    	mode: 'markers',
    	marker: {
    		size: 12,
    		line: {
    		color: 'rgba(217, 217, 217, 0.14)',
    		width: 0.5},
    		opacity: 0.8},
    	type: 'scatter3d'
    };
    var data = [trace1];
    var layout = {margin: {
    	l: 0,
    	r: 0,
    	b: 0,
    	t: 0
      }};
    if(lidar==0){
    Plotly.newPlot('myDiv', data, layout);
    lidar = 1;
    setTimeout(function(){lidar = 0}, 200);
    }

}

socket.on('robotData', function(data) {
    if (data.name == name.toLowerCase()) {
        if ((data.packet == "encoders") || (data.packet == "info")) {
            updateTable(data);
        }
        if ((data.packet == "lidar")) {
                      updateLidar(data.data);
      }
    }
});

function toggleLed(e) {
    if (e == 'l') {
        if (lled == 0) {
            sendMessage('left led on');
            lled = 1;
        } else {
            sendMessage('left led off');
            lled = 0;
        }
    } else if (e == 'r') {
        if (rled == 0) {
            sendMessage('right led on');
            rled = 1;
        } else {
            sendMessage('right led off');
            rled = 0;
        }
    }
}

function changeName() {
    let d = prompt("Please enter robot name");
    sendMessage('x');
    name = d;
    sendMessage('x');
    if (name != "*") {
        document.getElementById("robo").innerHTML = "Drive " + name;
        document.getElementById("title").innerHTML = name + " Web Panel";
        document.getElementById("logo-container").innerHTML = name + " Web Panel";
    } else {
        document.getElementById("robo").innerHTML = "Drive All";
        document.getElementById("title").innerHTML = "Web Panel";
        document.getElementById("logo-container").innerHTML = "Web Panel";
    }
}

function servoTest() {
    socket.emit('message', 'servo test');
}

function sendMessage(command) {
    let robo = name;
    if (robo != "") {
        var data = {
            "bot": robo,
            "command": command
        };
        socket.emit('message', data);
    }
}

function drivebot(e) {
    var evtobj = window.event ? event : e; //distinguish between IE's explicit event object (window.event) and Firefox's implicit.
    var unicode = evtobj.charCode ? evtobj.charCode : evtobj.keyCode;
    var actualkey = String.fromCharCode(unicode);
    var data = "Command Sent: "
    //Forwards
    if ((evtobj.keyCode == 119) && (active != evtobj.keyCode)) {
        active = 119;
        data += "Forward";
        sendMessage('w');
        document.getElementById("command").innerHTML = data;
    }
    //Backwards
    else if ((evtobj.keyCode == 115) && (active != evtobj.keyCode)) {
        active = 115;
        data += "Backward";
        sendMessage('s');
        document.getElementById("command").innerHTML = data;
    }
    //Left
    else if ((evtobj.keyCode == 97) && (active != evtobj.keyCode)) {
        active = 97;
        data += "Left";
        sendMessage('a');
        document.getElementById("command").innerHTML = data;
    }
    //Right
    else if ((evtobj.keyCode == 100) && (active != evtobj.keyCode)) {
        active = 100;
        data += "Right";
        sendMessage('d');
        document.getElementById("command").innerHTML = data;
    }


}

function stopbot(e) {
    active = 0;
    var data = "Command Sent: ";
    data += "Stop";
    sendMessage('x');
    document.getElementById("command").innerHTML = data;
}

document.onkeypress = drivebot;
document.onkeyup = stopbot;
