"""
Coop bridge worker — the one piece Supabase can't do itself: stays
permanently connected to HiveMQ and writes each incoming sensor reading
into Supabase's Postgres. Everything else (auth, REST API, live updates
to the app) is handled directly by Supabase once rows land here.

Deploy this as a single "worker" process on Railway/Render/Fly.io —
it has no web server, it just runs forever in the background.

Env vars required:
  MQTT_HOST, MQTT_PORT (8883), MQTT_USERNAME, MQTT_PASSWORD  — HiveMQ Cloud
  SUPABASE_DB_URL  — from Supabase: Project Settings -> Database -> Connection string
                     (use the "Session pooler" URI, it's friendlier for a
                     long-running single connection than the direct one)
"""

import os
import json
import certifi
import psycopg2
import paho.mqtt.client as mqtt

MQTT_HOST = os.environ["MQTT_HOST"]
MQTT_PORT = int(os.environ.get("MQTT_PORT", 8883))
MQTT_USERNAME = os.environ["MQTT_USERNAME"]
MQTT_PASSWORD = os.environ["MQTT_PASSWORD"]
SUPABASE_DB_URL = os.environ["SUPABASE_DB_URL"]

db_conn = psycopg2.connect(SUPABASE_DB_URL)
db_conn.autocommit = True


def on_connect(client, userdata, flags, reason_code, properties=None):
    print(f"[mqtt] connected: {reason_code}")
    client.subscribe("devices/+/sensors")


def on_message(client, userdata, msg):
    try:
        device_id = msg.topic.split("/")[1]
        payload = json.loads(msg.payload.decode())
    except Exception as e:
        print(f"[mqtt] bad message on {msg.topic}: {e}")
        return

    try:
        with db_conn.cursor() as cur:
            cur.execute(
                """INSERT INTO sensor_readings
                   (device_id, temperature, humidity, air_quality,
                    fan_on, humidifier_on, alarm_active)
                   SELECT %s,%s,%s,%s,%s,%s,%s
                   WHERE EXISTS (SELECT 1 FROM devices WHERE id = %s)""",
                (
                    device_id,
                    payload.get("temperature"),
                    payload.get("humidity"),
                    payload.get("airQuality"),
                    payload.get("fanOn"),
                    payload.get("humidifierOn"),
                    payload.get("alarmActive"),
                    device_id,
                ),
            )
        print(f"[db] inserted reading for {device_id}")
    except Exception as e:
        print(f"[db] insert failed: {e}")


client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
client.tls_set(ca_certs=certifi.where())
client.on_connect = on_connect
client.on_message = on_message

print("Starting bridge worker...")
client.connect(MQTT_HOST, MQTT_PORT, keepalive=30)
client.loop_forever()