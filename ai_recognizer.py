import os
import torch
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image

# Global model cache
_model = None
_weights = None
_categories = None

# Mapping common ImageNet class substrings to household categories and rooms
HOUSEHOLD_MAP = [
    # Electronics & Devices
    (["notebook", "laptop"], "Laptop", "Electronics", "Study Desk", "Workstation Surface"),
    (["mouse", "computer mouse"], "Computer Mouse", "Electronics", "Study Desk", "Desk Pad"),
    (["keyboard"], "Keyboard", "Electronics", "Study Desk", "Workstation Surface"),
    (["cellular telephone", "cellphone", "mobile phone", "cell"], "Smartphone", "Electronics", "Bedroom", "Nightstand Table"),
    (["headphone", "earphone", "earbuds"], "Wireless Earphones", "Audio & Devices", "Bedroom", "Nightstand Table"),
    (["plug", "power cord", "extension cord", "adapter"], "Charger", "Cables & Power", "Bedroom", "Study Desk Drawer"),
    (["hard disc", "hard drive"], "External Hard Drive", "Electronics", "Study Desk", "Desk Drawer"),
    (["modem", "router"], "Wi-Fi Router", "Networking", "Living Room", "TV Cabinet"),

    # Personal Essentials & Accessories
    (["wallet", "billfold", "purse", "moneybag"], "Wallet", "Personal Essentials", "Bedroom", "Wardrobe Upper Shelf"),
    (["digital watch", "analog watch", "stopwatch", "wrist watch"], "Smart Watch", "Accessories", "Bedroom", "Dressing Table"),
    (["sunglasses", "spectacles", "glasses"], "Eyeglasses", "Accessories", "Living Room", "Wall Shelf"),
    (["keys", "padlock", "combination lock"], "House Keys", "Essentials", "Living Room", "Wall Shelf"),
    (["passport", "envelope", "binder", "packet"], "Passport & Documents", "Documents", "Bedroom", "Wardrobe Upper Shelf"),

    # Bags & Clothing
    (["backpack", "knapsack", "rucksack", "haversack"], "Backpack", "Bags & Storage", "Bedroom", "Wardrobe Upper Shelf"),
    (["umbrella"], "Umbrella", "Outdoors", "Living Room", "Wall Shelf"),
    (["shoe", "sneaker", "running shoe"], "Shoes", "Footwear", "Bedroom", "Wardrobe Upper Shelf"),
    (["sock", "stocking"], "Socks", "Apparel", "Bedroom", "Drawer"),

    # Kitchen & Everyday
    (["water bottle", "pop bottle"], "Water Bottle", "Kitchen & Hydration", "Kitchen", "Countertop Rack"),
    (["coffee mug", "cup", "teacup"], "Coffee Mug", "Kitchen", "Kitchen", "Countertop Rack"),
    (["plate", "platter"], "Plate / Dishware", "Kitchen", "Kitchen", "Upper Cabinet B"),
    (["frying pan", "pan"], "Cookware", "Kitchen", "Kitchen", "Lower Cabinet"),

    # Stationery & Health
    (["ballpoint", "fountain pen", "pencil", "quill"], "Pen / Stationery", "Stationery", "Study Desk", "Pen Stand"),
    (["book", "notebook", "binder", "comic book"], "Notebook / Book", "Reading & Study", "Study Desk", "Bookcase Shelf"),
    (["pill bottle", "lotion", "medicine chest"], "First Aid / Medicine", "Health & Wellness", "Bedroom", "Nightstand Table")
]


def load_ai_model():
    """Lazily loads the pretrained MobileNetV3 model on CPU."""
    global _model, _weights, _categories
    if _model is None:
        _weights = models.MobileNet_V3_Small_Weights.DEFAULT
        _categories = _weights.meta["categories"]
        _model = models.mobilenet_v3_small(weights=_weights)
        _model.eval()
    return _model, _categories, _weights


def recognize_object_from_image(image_path_or_file):
    """
    Performs visual recognition on an uploaded object photograph.
    Returns:
        dict containing suggested_name, category, confidence, needs_confirmation,
        suggested_room, suggested_location, and top_predictions.
    """
    model, categories, weights = load_ai_model()

    # Open image
    if hasattr(image_path_or_file, 'read'):
        image = Image.open(image_path_or_file).convert('RGB')
    elif isinstance(image_path_or_file, str) and os.path.exists(image_path_or_file):
        image = Image.open(image_path_or_file).convert('RGB')
    else:
        raise ValueError("Invalid image provided for recognition.")

    # Apply standard preprocessing transforms for MobileNetV3
    preprocess = weights.transforms()
    input_tensor = preprocess(image).unsqueeze(0)  # Add batch dimension

    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)

    # Get top 5 predictions
    top5_prob, top5_catid = torch.topk(probabilities, 5)

    top_predictions = []
    for i in range(5):
        cat_name = categories[top5_catid[i].item()]
        prob = float(top5_prob[i].item())
        top_predictions.append({
            "label": cat_name,
            "probability": round(prob, 4)
        })

    best_cat_raw = categories[top5_catid[0].item()]
    best_prob = float(top5_prob[0].item())

    # Check for match in our household mapper
    matched_item = None
    for pred in top_predictions:
        label_lower = pred["label"].lower()
        for keywords, name, category, room, loc in HOUSEHOLD_MAP:
            for kw in keywords:
                if kw in label_lower:
                    matched_item = {
                        "suggested_name": name,
                        "category": category,
                        "confidence": round(pred["probability"], 2),
                        "suggested_room": room,
                        "suggested_location": loc
                    }
                    break
            if matched_item:
                break
        if matched_item:
            break

    if matched_item:
        suggested_name = matched_item["suggested_name"]
        category = matched_item["category"]
        confidence = matched_item["confidence"]
        suggested_room = matched_item["suggested_room"]
        suggested_location = matched_item["suggested_location"]
    else:
        # Fallback to cleaned ImageNet label
        clean_name = best_cat_raw.split(',')[0].replace('_', ' ').title()
        suggested_name = clean_name
        category = "Household Item"
        confidence = round(best_prob, 2)
        suggested_room = "Bedroom"
        suggested_location = "Study Desk Drawer"

    # Flag if confidence is low (< 0.20 or generic fallback)
    needs_confirmation = confidence < 0.25

    return {
        "status": "success",
        "suggested_name": suggested_name,
        "category": category,
        "confidence": confidence,
        "confidence_percentage": f"{int(confidence * 100)}%",
        "needs_confirmation": needs_confirmation,
        "suggested_room": suggested_room,
        "suggested_location": suggested_location,
        "top_predictions": top_predictions
    }
