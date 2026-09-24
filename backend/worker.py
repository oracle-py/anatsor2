
"""
Coop MQTT-to-Supabase bridge worker.

Receives sensor readings from HiveMQ and writes them
to Supabase PostgreSQL.

Required Railway environment variables:
    MQTT_HOST
    MQTT_PORT
    MQTT_USERNAME
    MQTT_PASSWORD
    SUPABASE_DB_URL
"""

import os
import json
import time
import logging

import certifi
import psycopg2
import paho.mqtt.client as mqtt


# --------------------------------------------------
# LOGGING
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

logger = logging.getLogger("coop-worker")


# --------------------------------------------------
# ENVIRONMENT VARIABLES
# --------------------------------------------------

MQTT_HOST = os.environ["MQTT_HOST"]
MQTT_PORT = int(os.environ.get("MQTT_PORT", "8883"))
MQTT_USERNAME = os.environ["MQTT_USERNAME"]
MQTT_PASSWORD = os.environ["MQTT_PASSWORD"]

SUPABASE_DB_URL = os.environ["SUPABASE_DB_URL"]

MQTT_SENSOR_TOPIC = "devices/+/sensors"
MQTT_STATUS_TOPIC = "devices/+/status"

ALERT_DEFINITIONS = {
    "tempHigh": ("temp_high", "critical", "Temperature is above the safe range"),
    "tempLow": ("temp_low", "warning", "Temperature is below the safe range"),
    "humHigh": ("humidity_high", "warning", "Humidity is above the safe range"),
    "humLow": ("humidity_low", "warning", "Humidity is below the safe range"),
    "airBad": ("air_bad", "critical", "Poor air quality or high ammonia detected"),
}


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------

db_conn = None


def connect_database():
    global db_conn

    while True:
        try:
            if db_conn is not None:
                try:
                    db_conn.close()
                except Exception:
                    pass

            db_conn = psycopg2.connect(
                SUPABASE_DB_URL,
                connect_timeout=10,
                sslmode="require",
            )

            db_conn.autocommit = True

            logger.info(
                "[db] Connected to Supabase PostgreSQL"
            )

            return

        except psycopg2.Error as error:
            logger.error(
                "[db] Connection failed: %s",
                error,
            )

            logger.info(
                "[db] Retrying in 30 seconds"
            )

            time.sleep(30)


# --------------------------------------------------
# SAVE SENSOR READING
# --------------------------------------------------

def save_reading(device_id, payload):
    global db_conn

    query = """
        INSERT INTO public.sensor_readings (
            device_id,
            temperature,
            humidity,
            air_quality,
            fan_on,
            humidifier_on,
            alarm_active,
            temperature_high,
            temperature_low,
            humidity_high,
            humidity_low,
            air_quality_bad,
            camera_live,
            detection_label,
            detection_confidence,
            detection_at
        )
        SELECT
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s
        WHERE EXISTS (
            SELECT 1
            FROM public.devices
            WHERE id = %s
        )
    """

    detection_label = payload.get("detectionLabel") or payload.get("ai_last_detection")
    if isinstance(detection_label, str):
        detection_label = detection_label.strip().lower()
    if detection_label not in ("rat", "snake"):
        detection_label = None

    values = (
        device_id,
        payload.get("temperature"),
        payload.get("humidity"),
        payload.get("airQuality"),
        # Older firmware does not publish these fields yet. Keep ingestion
        # compatible with it because the database columns are NOT NULL.
        payload.get("fanOn", False),
        payload.get("humidifierOn", False),
        payload.get("alarmActive", False),
        payload.get("tempHigh", False),
        payload.get("tempLow", False),
        payload.get("humHigh", False),
        payload.get("humLow", False),
        payload.get("airBad", False),
        # Missing means "not reported", not "offline". The device must send
        # an explicit true/false cameraLive value for a definitive status.
        payload.get("cameraLive"),
        detection_label,
        payload.get("detectionConfidence", payload.get("ai_confidence")) if detection_label else None,
        payload.get("detectionAt") if detection_label else None,
        device_id,
    )

    # Retry once after a database connection failure.
    for attempt in range(2):
        try:
            if db_conn is None or db_conn.closed:
                connect_database()

            with db_conn.cursor() as cursor:
                cursor.execute(query, values)
                inserted = cursor.rowcount
                if inserted == 1:
                    cursor.execute(
                        "UPDATE public.devices SET status = 'online', last_seen_at = now() WHERE id = %s",
                        (device_id,),
                    )
                    sync_alerts(cursor, device_id, payload)

            if inserted == 1:
                logger.info(
                    "[db] Inserted reading for %s",
                    device_id,
                )
            else:
                logger.warning(
                    "[db] Skipped %s: device not registered",
                    device_id,
                )

            return

        except psycopg2.OperationalError as error:
            logger.error(
                "[db] Connection lost: %s",
                error,
            )

            if attempt == 0:
                connect_database()

        except psycopg2.Error as error:
            logger.error(
                "[db] Insert failed for %s (SQLSTATE %s): %s",
                device_id,
                error.pgcode or "unknown",
                error,
            )
            return

    logger.error(
        "[db] Could not save reading for %s",
        device_id,
    )


def sync_alerts(cursor, device_id, payload):
    """Open and resolve alert history from device-owned condition flags."""
    for payload_key, (alert_type, severity, message) in ALERT_DEFINITIONS.items():
        if bool(payload.get(payload_key, False)):
            cursor.execute(
                """
                INSERT INTO public.alerts (device_id, type, severity, message)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (device_id, type) WHERE resolved_at IS NULL DO NOTHING
                """,
                (device_id, alert_type, severity, message),
            )
        else:
            cursor.execute(
                """
                UPDATE public.alerts SET resolved_at = now()
                WHERE device_id = %s AND type = %s AND resolved_at IS NULL
                """,
                (device_id, alert_type),
            )


def save_status(device_id, status):
    if status not in ("online", "offline"):
        logger.warning("[mqtt] Invalid status for %s: %s", device_id, status)
        return
    try:
        if db_conn is None or db_conn.closed:
            connect_database()
        with db_conn.cursor() as cursor:
            cursor.execute(
                "UPDATE public.devices SET status = %s, last_seen_at = now() WHERE id = %s",
                (status, device_id),
            )
            if status == "offline":
                cursor.execute(
                    """INSERT INTO public.alerts (device_id, type, severity, message)
                       SELECT %s, 'device_offline', 'warning', 'The AIPMS unit is offline'
                       WHERE EXISTS (SELECT 1 FROM public.devices WHERE id = %s)
                       ON CONFLICT (device_id, type) WHERE resolved_at IS NULL DO NOTHING""",
                    (device_id, device_id),
                )
            else:
                cursor.execute(
                    "UPDATE public.alerts SET resolved_at = now() WHERE device_id = %s AND type = 'device_offline' AND resolved_at IS NULL",
                    (device_id,),
                )
    except psycopg2.Error as error:
        logger.error("[db] Status update failed for %s: %s", device_id, error)


# --------------------------------------------------
# MQTT CALLBACKS
# --------------------------------------------------

def on_connect(
    client,
    userdata,
    flags,
    reason_code,
    properties=None,
):
    logger.info(
        "[mqtt] Connection result: %s",
        reason_code,
    )

    if reason_code.is_failure:
        logger.error(
            "[mqtt] Connection rejected"
        )
        return

    result, mid = client.subscribe([(MQTT_SENSOR_TOPIC, 1), (MQTT_STATUS_TOPIC, 1)])

    if result == mqtt.MQTT_ERR_SUCCESS:
        logger.info(
            "[mqtt] Subscribed to %s and %s",
            MQTT_SENSOR_TOPIC,
            MQTT_STATUS_TOPIC,
        )
    else:
        logger.error(
            "[mqtt] Subscription failed: %s",
            result,
        )


def on_message(client, userdata, msg):
    try:
        parts = msg.topic.split("/")

        if len(parts) != 3 or parts[0] != "devices" or not parts[1] or parts[2] not in ("sensors", "status"):
            logger.warning(
                "[mqtt] Unexpected topic: %s",
                msg.topic,
            )
            return

        device_id = parts[1]

        if parts[2] == "status":
            save_status(device_id, msg.payload.decode("utf-8").strip().lower())
            return

        payload = json.loads(
            msg.payload.decode("utf-8")
        )

        if not isinstance(payload, dict):
            logger.warning(
                "[mqtt] Invalid payload for %s",
                device_id,
            )
            return

        logger.info(
            "[mqtt] Received reading from %s",
            device_id,
        )

        save_reading(device_id, payload)

    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        logger.error(
            "[mqtt] Invalid message on %s: %s",
            msg.topic,
            error,
        )


def on_disconnect(
    client,
    userdata,
    disconnect_flags,
    reason_code,
    properties=None,
):
    logger.warning(
        "[mqtt] Disconnected: %s",
        reason_code,
    )


# --------------------------------------------------
# START WORKER
# --------------------------------------------------

def main():
    logger.info(
        "Starting Coop MQTT bridge worker"
    )

    connect_database()

    client = mqtt.Client(
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
    )

    client.username_pw_set(
        MQTT_USERNAME,
        MQTT_PASSWORD,
    )

    client.tls_set(
        ca_certs=certifi.where(),
    )

    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect

    client.reconnect_delay_set(
        min_delay=1,
        max_delay=60,
    )

    logger.info(
        "[mqtt] Connecting to HiveMQ"
    )

    client.connect(
        MQTT_HOST,
        MQTT_PORT,
        keepalive=30,
    )

    client.loop_forever(
        retry_first_connection=True,
    )


if __name__ == "__main__":
    main()
