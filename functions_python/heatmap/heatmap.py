import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import io
import base64

# Store event data globally
heatmap_data = []

def generate_heatmap(req):
    """
    Generates a heatmap based on received (x, y) coordinates and returns it as a base64 string.
    """
    global heatmap_data

    try:
        event = json.loads(req)
        x, y = event.get("x"), event.get("y")
        
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

        return {"message": "Heatmap generated", "image_base64": img_base64}

    except Exception as e:
        return {"error": str(e)}
