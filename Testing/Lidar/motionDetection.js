const RPLidar = require('rplidar');
const lidar = new RPLidar(path= '/dev/ttyUSB0');

//Array Comparison Data
var previous = {};
var currrent = {};
var firstArray = 0;
var count = 0;

//Node Name
var robotName = "Lidar 1";

//Start Logging
var readline = require('readline');
var current = new Date();
var logfile_name = './logs/log-' + current.getFullYear() + "-"+ current.getMonth() + "-" + current.getDay()+ "-" + current.getHours()+ "-" + current.getMinutes() +'.txt'
var fs = require('fs')
var logger = fs.createWriteStream(logfile_name, {
  flags: 'a' // 'a' means appending (old data will be preserved)
})
logger.write("Lidar Network Log ("+current.toUTCString()+")"); //append header to log
logger.write('\r\n'); //new line

//Initialize Lidar
lidar.init().then(() => {
    return lidar.getHealth();
}).then(health => {
    console.log('health: ', health);
    return lidar.getInfo();
}).then(info => {
    console.log('info: ', info);
}).then(() => {
    lidar.stopScan();
    lidar.scan();
});

function compare(current,previous) {
  var matches = 0;
  var i;
  var currentLength = Object.keys(previous).length;
  var previousLength = Object.keys(current).length;
  var listLength = 0;
  if(currentLength<previousLength){
    listLength = currentLength;
  }
  else{
    listLength = previousLength;
  }
  for (i = 0; i < listLength; i++) {
   if((parseInt(current[i].angle, 10))==(parseInt(previous[i].angle, 10))){
     if(current[i].distance!=previous[i].distance){
       matches = matches+1;
     }
   }
   else{
     matches = matches+1;
   }
  }
  console.log("Matches: "+matches);
 }


lidar.on('data', listener3 = function (data) {
  if(data.start==1){
    //First 3 Arrays are garbage start once 3 have passed
    if(firstArray==3){
      compare(current,previous);
      var reqLog = JSON.stringify(previous);
      logger.write(reqLog); //append to log
      logger.write('\r\n'); //new line
      console.log("New Array Stored!");
    }
    //Increment Array Counter to
    if(firstArray<3){
      firstArray= firstArray+1;
    }
    //Set Previous to Current
    previous = current;
    //Clear Current and Counter and store first value
    current = {};
    count = 0;
    current[count] = {'angle': data.angle, 'distance': data.distance};
  }
  else{
    //If not first value store into Current
    count = count+1;
    current[count] = {'angle': data.angle, 'distance': data.distance};
  }
  });

//Stop Lidar When Closing
process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    lidar.stopScan();
    process.exit();
});
