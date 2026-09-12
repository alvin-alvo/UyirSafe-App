import torch, json
import torch.nn as nn

CLASSES = json.load(open("classes.json"))

# Check 1 — head weight shapes
state = torch.load("best_model.pt", map_location="cpu")
print("=== HEAD WEIGHTS ===")
for k, v in state.items():
    if "head" in k:
        print(f"  {k}: {v.shape}")

# Check 2 — dummy forward pass with random input
# If model is in train mode, dropout randomizes outputs
class SiglipClassifier(nn.Module):
    def __init__(self, num_classes=4, hidden=768, dropout=0.3):
        super().__init__()
        # dummy encoder stub — just to test the head
        self.head = nn.Sequential(
            nn.LayerNorm(hidden),
            nn.Dropout(dropout),
            nn.Linear(hidden, 256),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(256, num_classes),
        )
    def forward(self, x):
        return self.head(x)

m = SiglipClassifier()
head_keys = {k.replace("head.", ""): v 
             for k, v in state.items() if k.startswith("head.")}
m.head.load_state_dict(head_keys)

# Test in TRAIN mode — outputs will randomly vary (bad)
m.train()
x = torch.ones(1, 768)
out_train = [torch.softmax(m(x)[0], dim=0).tolist() for _ in range(3)]
print("\n=== TRAIN MODE (should vary each run — dropout active) ===")
for o in out_train:
    print("  ", [f"{v:.3f}" for v in o])

# Test in EVAL mode — outputs must be identical (correct)
m.eval()
out_eval = [torch.softmax(m(x)[0], dim=0).tolist() for _ in range(3)]
print("\n=== EVAL MODE (must be identical — dropout disabled) ===")
for o in out_eval:
    print("  ", [f"{v:.3f}" for v in o])

print("\n=== FINAL LAYER BIAS (tells you default class preference) ===")
bias = state["head.5.bias"]
for cls, b in zip(CLASSES, bias.tolist()):
    print(f"  {cls:<12}: {b:+.4f}")
print("  → highest bias = class model prefers when uncertain")