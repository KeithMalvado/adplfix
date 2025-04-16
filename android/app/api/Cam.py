from flask import Flask, request, jsonify
from ultralytics import YOLO
import base64
import numpy as np
import cv2

app = Flask(__name__)
model = YOLO("yolov8n.pt")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    img_data = base64.b64decode(data['image'])
    np_img = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    results = model(img)[0]
    detections = []
    for box in results.boxes.data.tolist():
        x1, y1, x2, y2, conf, cls = box
        detections.append({
            "box": [x1, y1, x2, y2],
            "confidence": round(conf, 2),
            "class": int(cls)
        })
    print('Deteksi:', detections)  # Tambahkan log untuk melihat hasil deteksi
    return jsonify(detections)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
