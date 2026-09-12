import torch
from torchvision import transforms
from torchvision.models import mobilenet_v2
from PIL import Image
import gradio as gr
import sys
import json

# Class labels
class_names = ['accident', 'others', 'potholes', 'traffic']

# Confidence threshold for human review.
# Images with top-1 confidence below this are marked "Needs Review"
# instead of being auto-accepted/rejected. Frontend already renders
# this status (ReportsPage.jsx) so no frontend change is needed.
CONFIDENCE_THRESHOLD = 0.70

# Labels treated as "Irrelevant" for the review policy.
# Current MobileNetV2 checkpoint uses 'others'; a future SigLIP2
# checkpoint may emit 'Irrelevant' directly — accept both.
IRRELEVANT_LABELS = {'others', 'irrelevant'}

# Load trained model
try:
    print("Loading MobileNetV2 model architecture...")
    model = mobilenet_v2(weights='IMAGENET1K_V1')
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, len(class_names))
    print("Loading state dictionary from 'uyir.pth'...")
    model.load_state_dict(torch.load("uyir.pth", map_location=torch.device('cpu')))
    model.eval()
    print("Model loaded successfully.")
except FileNotFoundError:
    print("ERROR: Model weights file 'uyir.pth' not found. Please ensure it exists in the same directory.")
    sys.exit(1)
except RuntimeError as e:
    print(f"ERROR: Model architecture or version mismatch when loading state_dict. Details:\n{str(e)}")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: Failed to load model. Exception details:\n{str(e)}")
    sys.exit(1)

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# Prediction function
def get_review_status(label, confidence):
    """Map (label, confidence) to Accepted / Needs Review / Rejected.

    Policy: confidence < CONFIDENCE_THRESHOLD -> "Needs Review"
    (even for "Irrelevant"), instead of auto-rejecting.
    High-confidence irrelevant -> "Rejected", else "Accepted".
    """
    try:
        conf = float(confidence)
    except (TypeError, ValueError):
        return "Needs Review"
    if conf < CONFIDENCE_THRESHOLD:
        return "Needs Review"
    if str(label).lower() in IRRELEVANT_LABELS:
        return "Rejected"
    return "Accepted"


def classify_with_status(img):
    """Return (probs_dict, top_label, top_confidence, status)."""
    probs = classify_image(img)
    if "error" in probs:
        return probs, "Unknown", 0.0, "Needs Review"
    top_label = max(probs, key=probs.get)
    top_conf = float(probs[top_label])
    return probs, top_label, top_conf, get_review_status(top_label, top_conf)


def classify_image(img):
    try:
        # If img is a filepath (string), open it (used in CLI testing)
        if isinstance(img, str):
            img = Image.open(img)
            
        # Ensure it's a PIL Image and convert to RGB (strips alpha channel & handles grayscale)
        if not isinstance(img, Image.Image):
            raise ValueError(f"Expected PIL Image, got {type(img)}")
            
        img = img.convert("RGB")
        
        # Apply transforms and add batch dimension
        img_tensor = transform(img).unsqueeze(0)
        
        with torch.no_grad():
            output = model(img_tensor)
            probs = torch.nn.functional.softmax(output[0], dim=0)
            return {class_names[i]: float(probs[i]) for i in range(len(class_names))}
    except Exception as e:
        print(f"Error during image classification preprocessing/prediction: {str(e)}")
        return {"error": 1.0}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # CLI mock execution mode
        image_path = sys.argv[1]
        print(f"\n--- Mock Execution Mode ---")
        print(f"Target Image: {image_path}")
        result = classify_image(image_path)
        print("Prediction Result:")
        print(json.dumps(result, indent=2))
        if "error" not in result:
            top = max(result, key=result.get)
            print(f"Top: {top} ({result[top]:.4f}) -> {get_review_status(top, result[top])}")
        print("---------------------------\n")
    else:
        # Launch Gradio server
        print("\nStarting Gradio classification server on http://0.0.0.0:7860...")
        gr.Interface(
            fn=classify_image,
            inputs=gr.Image(type="pil"),
            outputs=gr.Label(num_top_classes=2),
            title="Traffic vs Pothole Classifier",
            description="Upload an image to classify it as traffic or pothole"
        ).launch(share=False, server_name="0.0.0.0")