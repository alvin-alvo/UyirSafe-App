import torch
from torchvision import transforms
from torchvision.models import mobilenet_v2
from PIL import Image
import gradio as gr

# Class labels
class_names = ['accident', 'others', 'potholes', 'traffic']

# Load trained model
model = mobilenet_v2(weights='IMAGENET1K_V1')
model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, len(class_names))
model.load_state_dict(torch.load("uyir.pth", map_location=torch.device('cpu')))
model.eval()

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# Prediction function
def classify_image(img):
    img = transform(img).unsqueeze(0)
    with torch.no_grad():
        output = model(img)
        probs = torch.nn.functional.softmax(output[0], dim=0)
        top_idx = torch.argmax(probs).item()
        return {
            "label": class_names[top_idx],
            "confidence": round(probs[top_idx].item(), 4)
        }

# Launch Gradio server (local-only, JSON output)
gr.Interface(
    fn=classify_image,
    inputs=gr.Image(type="pil"),
    outputs=gr.Label(num_top_classes=2),
    title="Traffic vs Pothole Classifier",
    description="Upload an image to classify it as traffic or pothole"
).launch(share=False, server_name="0.0.0.0")