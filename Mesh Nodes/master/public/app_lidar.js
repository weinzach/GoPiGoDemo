var socket = io();
var lidar = 0;
var openedWindow;

socket.on('connect', function() {
    console.log("Socket Status: Connected");
});
socket.on('disconnect', function() {
    console.log("Socket Status: Disconnected");
});

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
    setTimeout(function(){lidar=0;}, 800);
    }

}

socket.on('robotData', function(data) {
    if (data.name == name.toLowerCase()) {
        if ((data.packet == "lidar")) {
              updateLidar(data.data);
      }
    }
});
