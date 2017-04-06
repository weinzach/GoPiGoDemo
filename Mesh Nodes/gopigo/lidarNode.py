import zerorpc
from rplidar import RPLidar
import json

c = zerorpc.Client()
c.connect("tcp://127.0.0.1:8002")

#Load in Config File
with open('nodeConfig.json') as data_file:
    config = json.load(data_file)
node_name = config["node_name"]
robot_type = config["robot_type"]
lidarPort = config["lidar_port"]

#Main run function
def lidarScan():
        #Intialize Variables
        firstArray = 0
        previous = []
        current = []
        lidar = RPLidar(lidarPort)
        print('Recording measurments... Press Crl+C to stop')

        try:
                #Start Lidar Scanning
                for measurment in lidar.iter_measurments():
                        if measurment[0] == True:
                                if(len(current)>1):
                                    data = {}
                                    data['name'] = node_name
                                    data['type'] = robot_type
                                    data['packet'] = 'lidar'
                                    data['data'] = current
                                    c.sendData(json.dumps(data))
                        #Append Data to Current Array
                                current = []
                                current.append(str(measurment[2])+" "+str(measurment[3]))
                        else:
                                current.append(str(measurment[2])+" "+str(measurment[3]))
        except KeyboardInterrupt:
                print('Stopping...')
                #Stop Lidar
                lidar.stop()
                lidar.disconnect()
        except:
                print('Restarting...')
                #Stop Lidar
                lidar.stop()
                lidar.disconnect()
                lidarScan()

if __name__ == '__main__':
	lidarScan()
