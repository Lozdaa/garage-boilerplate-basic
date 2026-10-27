from sense_hat import SenseHat
import math
import time
from datetime import datetime
import pathlib
from validateJSON import validate_enviro_config
import sqlite3 as lite
import sys
import SensorMonitorFaces
import requests
import os
from dotenv import load_dotenv


'''
Class is not used here
but this uses the sense hats sensors as to log data and then store it into envirotrack.db
a SQLite database which is created in this file if not existing prior to running
timestamp is used in data as well since that allows for graphing of the data over time in task 4
'''

load_dotenv(pathlib.Path(__file__).parent / ".env")
URL = f"{os.environ['API_URL']}/api/devices/{os.environ['DEVICE_ID']}/readings"
KEY = os.environ["DEVICE_KEY"]

# Connect to the SQLite database
con = lite.connect("envirotrack.db")

cur= con.cursor()

# Create the table if it doesn't exist
cur.execute('''
            CREATE TABLE IF NOT EXISTS sensor_data (
            logID INTEGER PRIMARY KEY
                        UNIQUE
                        NOT NULL,
            timestamp               TEXT,
            pressure           NUMERIC,
            pressure_status    TEXT,
            temperature        NUMERIC,
            temperature_status TEXT,
            humidity           NUMERIC,
            humidity_status    TEXT,
            pitch              NUMERIC,
            pitch_status       TEXT,
            roll               NUMERIC,
            roll_status        TEXT,
            yaw                NUMERIC,
            yaw_status         TEXT
        );
            ''')

con.commit()

sense = SenseHat()
sense.clear()

#Making sure sensors are ready for when first reading happens
sense.get_pressure()
time.sleep(0.5)

# Making this a string for ease of use
config_path = pathlib.Path(__file__).parent.resolve() / "enviro_config.json"

# Storing the config details since if validated it will have all that is needed
# As well so that the details can be used again easier
enviro_config = validate_enviro_config(config_path)

# As in tiltEmotions used to make angles record go between -180 to 180 for easy comparison
def normalise(angle):
    if angle > 180:
        angle -= 360
    return angle

last_sensor_check = time.time() - 10 # Initialising this to the current time minus 10 so that the first check is done immediately
last_display_update = time.time() - 5 # Initialising this to the current time minus 5 so that the first display update is done immediately

#work_mode = True

display_index = 0
displays = []

y_initial = normalise(sense.get_orientation()['yaw'])

sos_pending = False
manual_help = False
in_danger = False

sm_faces = SensorMonitorFaces.SensorAnimatorFaces()

animatedDisplays = [sm_faces.pendant_status_health, sm_faces.pendant_status_danger, sm_faces.pendant_status_manual_help]
displayAnimation = True
count = 0
frameCount = 0
inputDelay = 3
lastAction = time.time() - inputDelay
inactive = False
animationDelay = 0.4
frameDisplayed = time.time() - animationDelay

sm_healthy = 0
sm_danger = 1
sm_manual = 2

while True:
    
    match in_danger:
        case True:
            count = 1
        case False:
            match manual_help or sos_pending:
                case True:
                    count = 2
                case False:
                    count = 0
    
    currentDisplay = animatedDisplays[count]
    animationLength = len(currentDisplay()) - 1
    
    if displayAnimation and (time.time() - frameDisplayed) >= animationDelay:
        sense.set_pixels(currentDisplay()[frameCount])
        frameDisplayed = time.time()
        if frameCount >= animationLength:
            frameCount = 0
        else:
            frameCount += 1

    curr_time = time.time()
    if curr_time - last_sensor_check >= 10: # Check every 10 seconds

        print(f"Initial Normalised Yaw: {y_initial}")
        # Getting the current time for database logging
        curr_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Pressure
        pressure = sense.get_pressure()
        print(f"Pressure: {pressure}")
        
        if pressure < enviro_config["pressure"]["min"]:
            pressure_status = "Low"
        elif pressure > enviro_config["pressure"]["max"]:
            pressure_status = "High"
        else:
            pressure_status = "Comfortable"
        
        # Temperature
        temperature = sense.get_temperature()
        temperature -= 2 # Calibration offset
        print(f"Temperature: {temperature}")
        
        if temperature < enviro_config["temperature"]["min"]:
            temperature_status = "Low"
        elif temperature > enviro_config["temperature"]["max"]:
            temperature_status = "High"
        else:
            temperature_status = "Comfortable"
        
        # Humidity
        humidity = sense.get_humidity()
        print(f"Humidity: {humidity}")
        if humidity < enviro_config["humidity"]["min"]:
            humidity_status = "Low"
        elif humidity > enviro_config["humidity"]["max"]:
            humidity_status = "High"
        else:
            humidity_status = "Comfortable"
        
        
        orientation = sense.get_orientation()
        p_raw = orientation['pitch']
        r_raw = orientation['roll']
        y_raw = orientation['yaw']
        
        # Normalised values for state check
        p = normalise(orientation['pitch'])
        r = normalise(orientation['roll'])
        y = normalise(orientation['yaw'])
        
        print(f"Pitch: {p_raw}, Roll: {r_raw}, Yaw: {y_raw}")
        print(f"Normalised Angles: Pitch: {p}, Roll: {r}, Yaw: {y}")
        
        # Using the normalised values to do JSON comparisons for status of orientation
        if p < enviro_config["orientation"]["pitch"]["min"] or p > enviro_config["orientation"]["pitch"]["max"]:
            pitch_status = "Tilted"
        else:
            pitch_status = "Aligned"
        
        if r < enviro_config["orientation"]["roll"]["min"] or r > enviro_config["orientation"]["roll"]["max"]:
            roll_status = "Tilted"
        else:
            roll_status = "Aligned"
        
        # As task 3 says, yaw must remain in a certain sector
        # Taking where the initial yaw is and checking it to the current normalised raw
        # Will give us the difference so that the enviro_config max and min will work appropriately
        yaw_sector_check = normalise(y - y_initial)

        if yaw_sector_check < enviro_config["orientation"]["yaw"]["min"] or yaw_sector_check > enviro_config["orientation"]["yaw"]["max"]:
            yaw_status = "Tilted"
        else:
            yaw_status = "Aligned"
            
        '''cur.execute("""
        INSERT INTO sensor_data (
            timestamp, temperature, temperature_status,
            humidity, humidity_status, pressure, pressure_status,
            pitch, pitch_status, roll, roll_status, yaw, yaw_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
        curr_datetime, temperature, temperature_status,
        humidity, humidity_status, pressure, pressure_status,
        p_raw, pitch_status, r_raw, roll_status, y_raw, yaw_status
        ))
        
        con.commit()'''
        
        last_sensor_check = time.time()
        
        # Temperature colours, blue for low, red for high, green for comfortable
        if temperature_status == "Low":
            temperature_colour = (0, 0, 255)
        elif temperature_status == "High":
            temperature_colour = (255, 0, 0)
        else:
            temperature_colour = (0, 255, 0)
        
        # Humidity colours, blue for low, red for high, green for comfortable
        if humidity_status == "Low":
            humidity_colour = (0, 0, 255)
        elif humidity_status == "High":
            humidity_colour = (255, 0, 0)
        else:
            humidity_colour = (0, 255, 0)
        
        # Pressure colours, blue for low, red for high, green for comfortable
        if pressure_status == "Low":
            pressure_colour = (0, 0, 255)
        elif pressure_status == "High":
            pressure_colour = (255, 0, 0)
        else:
            pressure_colour = (0, 255, 0)
        
        # Orientation colours, amber if any are tilted
        if pitch_status == "Tilted" or roll_status == "Tilted" or yaw_status == "Tilted":
            orientation_colour = (255, 191, 0)
        else:
            orientation_colour = (0, 255, 0)
        
        # Making array list for the update messages
        displays = [
            (f"T:{round(temperature)}", temperature_colour),
            (f"P:{round(pressure)}", pressure_colour),
            (f"H:{round(humidity)}", humidity_colour),
            (f"P:{round(p_raw)}/R:{round(r_raw)}/Y:{round(y_raw)}", orientation_colour)
        ]
        
        accel = sense.get_accelerometer_raw()

        reading = {
            "accel": {"x": round(accel["x"], 3), "y": round(accel["y"], 3), "z": round(accel["z"], 3)},
            "temperature": round(temperature, 1),
            "humidity": round(humidity, 1),
            "orientation": {"pitch": round(p, 1), "roll": round(r, 1), "yaw": round(yaw_sector_check, 1)},
            "pressure": round(pressure, 1),
            "sosPressed": manual_help,
        }
        print(reading)
        
        reading["sosPressed"] = manual_help
        try:
            r = requests.post(URL, json=reading, headers={"x-device-key": KEY}, timeout=5)
            if not r.ok:
                print("Rejected:", r.status_code, r.text)   # shows the backend's reason, e.g. which field
            else:
                reply = response.json()
                print("Server:", reply)
                sos_pending = False                                  # server has it now
                manual_help = reply.get("sosActive", False)          # server decides
                in_danger = reply.get("dangerActive", False)         # server decides (rules come later)
        except requests.RequestException as e:
            print("Send failed:", e)
        
    # Section used to update the display
    """if curr_time - last_display_update >= 5 and work_mode:
        message, colour = displays[display_index]
        sense.show_message(message, text_colour=colour, scroll_speed=0.05)
        
        display_index = (display_index + 1) % len(displays)
        
        last_display_update = time.time()"""
        
    
    for event in sense.stick.get_events():
        if event.action == "pressed" and event.direction == "middle":
            sos_pending = True
            last_sensor_check = 0
            
    time.sleep(0.05)



