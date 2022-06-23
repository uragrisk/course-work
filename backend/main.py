import threading
import time
from datetime import datetime
import serial
from flask import Flask, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:123456@localhost/feeder"
CORS(app)
db = SQLAlchemy(app)

arduino_serial = serial.Serial("COM2", 9600, timeout=1)


class All_Meals(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_meal_time = db.Column(db.String(255), nullable=False)
    second_meal_time = db.Column(db.String(255), nullable=False)
    third_meal_time = db.Column(db.String(255), nullable=False)
    fourth_meal_time = db.Column(db.String(255), nullable=False)

    def __init__(self, firstMealTime, secondMealTime, thirdMealTime, fourthMealTime,):
        self.id = 1
        self.first_meal_time = firstMealTime
        self.second_meal_time = secondMealTime
        self.third_meal_time = thirdMealTime
        self.fourth_meal_time = fourthMealTime


class Feeding_History(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    portion_size = db.Column(db.Integer, nullable=False)
    name_of_feed = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    def __init__(self, timestamp, portion_size=200, name_of_feed="Josera"):
        self.portion_size = portion_size
        self.name_of_feed = name_of_feed
        self.timestamp = timestamp


def send_command(command):
    arduino_serial.write(command.encode())
    print(command)
    time.sleep(4)
    arduino_serial.flush()


def simplify_json(data):
    simple_json = {}
    i = 1
    for v in data.values():
        simple_json[str(i)] = v.split(":")
        i = i + 1
    return simple_json


@app.route('/home', methods=["POST"])
def home():
    data = request.get_json()

    if data == "feed_now":
        send_command("feed_now")
        pet_fed()
        return "pet_fed", 201

    if data == "discard_meals":
        db.session.query(All_Meals).delete()
        db.session.commit()
        send_command('discard_meals')
        return "meals_deleted", 202

    else:
        only_time = simplify_json(data)
        ar_data = json.dumps(only_time)
        arduino_serial.write(ar_data.encode('ascii'))
        arduino_serial.flush()
        db.session.query(All_Meals).delete()
        db.session.add(All_Meals(**data))
        db.session.commit()
    return "Ok", 200


@app.route('/home', methods=['GET'])
def index():
    feeding_history = get_history()
    a = json.dumps(feeding_history)
    return a, 200


def pet_fed():
    now = datetime.now()
    dt_string = now.strftime("%Y-%m-%d %H:%M:%S")
    db.session.add(Feeding_History(dt_string))
    db.session.commit()


def get_history():
    feeding_history = []
    all_events = Feeding_History.query.all()
    for event in all_events:
        feeding_history.append({"id": event.id, "portionSize": f'{event.portion_size} g',
                                "nameOfFeed": event.name_of_feed,
                                "timestamp": event.timestamp.strftime("%m/%d/%Y, %H:%M")})
    return feeding_history


def serial_waiting():
    while (True):
        if arduino_serial.inWaiting() > 0:
            data_str = arduino_serial.read(arduino_serial.inWaiting()).decode("utf-8")
            print(data_str)
            if data_str == "pet_fed":
                pet_fed()
        time.sleep(0.1)


if __name__ == '__main__':
    db.create_all()
    threading.Thread(target=lambda: app.run(debug=True, use_reloader=False)).start()
    serial_waiting()
