from firebase_functions import https_fn
from firebase_admin import initialize_app
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64

# Store event data globally
heatmap_data = []

# Initialize Firebase Admin
initialize_app()

# Common response headers
common_headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

def generate_heatmap(event):
    """
    Generates a heatmap based on received (x, y) coordinates and returns it as a base64 string.
    """
    global heatmap_data

    try:
        x, y = event.get("x"), event.get("y")  # Directly get x, y from dict
        
        if x is None or y is None:
            return {"error": "Invalid input, x and y are required"}
        
        heatmap_data.append((x, y))

        data = np.array(heatmap_data)
        plt.figure(figsize=(6, 4))
        sns.kdeplot(x=data[:, 0], y=data[:, 1], cmap="Reds", fill=True, bw_adjust=0.5)
        img_io = io.BytesIO()
        plt.savefig(img_io, format="png", bbox_inches="tight")
        plt.close()
        img_io.seek(0)
        img_base64 = base64.b64encode(img_io.getvalue()).decode("utf-8")
        print(img_base64)
        return {"message": "Heatmap generated", "image_base64": img_base64}

    except Exception as e:
        return {"error": str(e)}

@https_fn.on_request()
def get_heatmap(req):
    print(req.method)
    
    if req.method == 'OPTIONS':
        headers = {
            **common_headers,
            'Access-Control-Allow-Methods': 'GET, POST',
            'Access-Control-Max-Age': '3600'
        }
        return '', 204, headers  # Correct CORS response

    try:
        req_data = req.get_json(silent=True)  # Firebase automatically parses JSON

        if not req_data:
            return json.dumps({"error": "Invalid JSON input"}), 400, common_headers
        
        print("Valid JSON received:", req_data)
        heatmap_response = generate_heatmap(req_data)  # Already a dict, no need to parse JSON
        
        return json.dumps(heatmap_response), 200, common_headers  

    except Exception as e:
        return json.dumps({"error": str(e)}), 500, common_headers
