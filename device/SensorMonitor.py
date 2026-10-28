'''
Pendant client for Raspberry Pi + Sense HAT.

Every READING_INTERVAL seconds: reads temperature, humidity, pressure,
acceleration and orientation, and POSTs them to the backend. The backend
decides whether the pendant is in danger; this script only shows its answer
with the LED faces (healthy / danger / manual help).

Joystick press = SOS: sent immediately, and kept (sos_pending) until the
server confirms it, so a press during a network drop isn't lost.
'''
from sense_hat import SenseHat
import time
import pathlib
import SensorMonitorFaces
import requests
import os
from dotenv import load_dotenv

load_dotenv(pathlib.Path(__file__).parent / ".env")
URL = f"{os.environ['API_URL']}/api/devices/{os.environ['DEVICE_ID']}/readings"
KEY = os.environ["DEVICE_KEY"]

sense = SenseHat()
sense.clear()
sense.get_pressure()   # warm-up read
time.sleep(0.5)

# As in tiltEmotions used to make angles record go between -180 to 180 for easy comparison
def normalise(angle):
    if angle > 180:
        angle -= 360
    return angle


READING_INTERVAL = 30

last_sensor_check = time.time() - READING_INTERVAL # Initialising this to the current time minus READING_INTERVAL so that the first check is done immediately

y_initial = normalise(sense.get_orientation()['yaw'])

sos_pending = False
manual_help = False
in_danger = False

sm_faces = SensorMonitorFaces.SensorAnimatorFaces()

animatedDisplays = [sm_faces.pendant_status_health, sm_faces.pendant_status_danger, sm_faces.pendant_status_manual_help]
count = 0
last_count = 0
frameCount = 0
animationDelay = 0.4
frameDisplayed = time.time() - animationDelay

sm_healthy = 0
sm_danger = 1
sm_manual = 2

while True:
    
    match in_danger:
        case True:
            count = sm_danger
        case False:
            match manual_help or sos_pending:
                case True:
                    count = sm_manual
                case False:
                    count = sm_healthy
    
    if count != last_count:      # switched animation → start at its first frame
        frameCount = 0
        last_count = count

    frames = animatedDisplays[count]()
    if time.time() - frameDisplayed >= animationDelay:
        sense.set_pixels(frames[frameCount])
        frameDisplayed = time.time()
        frameCount = (frameCount + 1) % len(frames)

    curr_time = time.time()
    if curr_time - last_sensor_check >= READING_INTERVAL: # Checks by what is set on READING_INTERVAL
        
        # Pressure
        pressure = sense.get_pressure()
        
        # Temperature
        temperature = sense.get_temperature()
        temperature -= 2 # Calibration offset
        
        # Humidity
        humidity = sense.get_humidity()
        
        
        orientation = sense.get_orientation()
        
        # Normalised values for state check
        p = normalise(orientation['pitch'])
        r = normalise(orientation['roll'])
        y = normalise(orientation['yaw'])
        
        yaw_sector_check = normalise(y - y_initial)
        
        last_sensor_check = time.time()
        
        
        acceleration = sense.get_accelerometer_raw()

        reading = {
            "acceleration": {"x": round(acceleration["x"], 3), "y": round(acceleration["y"], 3), "z": round(acceleration["z"], 3)},
            "temperature": round(temperature, 1),
            "humidity": round(humidity, 1),
            "orientation": {"pitch": round(p, 1), "roll": round(r, 1), "yaw": round(yaw_sector_check, 1)},
            "pressure": round(pressure, 1),
            "sosPressed": sos_pending,
        }
        print(reading)
        
        try:
            response = requests.post(URL, json=reading, headers={"x-device-key": KEY}, timeout=5)
            if not response.ok:
                print("Rejected:", response.status_code, response.text)   # shows the backend's reason, e.g. which field
            else:
                reply = response.json()
                print("Server:", reply)
                sos_pending = False                                  # server has it now
                manual_help = reply.get("sosActive", False)          # server decides
                in_danger = reply.get("dangerActive", False)         # server decides (Uses its own rules)
        except requests.RequestException as e:
            print("Send failed:", e)
        
    
    for event in sense.stick.get_events():
        if event.action == "pressed" and event.direction == "middle":
            sos_pending = True
            last_sensor_check = 0
            
    time.sleep(0.05)



