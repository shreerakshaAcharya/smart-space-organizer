# Smart Space Organizer 🏠✨

> **Tagline:** *"Find it. Store it. Organize it."*

A modern, responsive, aesthetic web application designed to help you track, organize, and remember where all your household belongings, documents, and devices are kept. Built with pure **HTML5, CSS3, and JavaScript** featuring a contemporary glassmorphic aesthetic with purple, pink, and lavender gradients.

---

## ✨ Features

- **Page 1: Landing / Welcome Page**
  - **Hero Section**: Tagline, descriptive copy, and a large **`+ CREATE`** pill button with glowing hover animation.
  - **Cozy 3D Room Visual**: High-resolution 3D isometric bedroom & study desk illustration with ambient purple/lavender mood lighting.
  - **Dynamic Metric Cards**:
    - 📦 *Items Stored* (Click to view full directory & search stored belongings)
    - 📍 *Locations Saved*
    - 🏠 *Spaces Organized*
  - **Top Navigation Bar**: Brand logo & quick Login modal with multi-device sync simulation.
  - **Left Responsive Sidebar**: Quick navigation for Home, Items, Organize (`+`), and Settings.

- **Page 2: "Where did you keep it?" Page (Store an Item)**
  - **Dual Mode Toggle**: Switch between *Type Item* and *Upload Image*.
  - **Search & Item Name Input**: Search bar with clear button (`✕`) and quick suggestion chips (⚡ *MacBook Charger*, ⌚ *Smart Watch*, 🛂 *Passport*, 🔑 *House Keys*, 🎧 *AirPods*).
  - **Smart Image Upload Dropzone**:
    - Drag & drop or click to upload photos.
    - Real-time image preview and AI item detection simulation (auto-identifies item and recommends the best location).
  - **8 Location Cards Grid** (as specified):
    1. 🚪 **Wardrobe** (Hangers & Upper Shelves)
    2. 🛏️ **Bedroom** (Bedside & Nightstand)
    3. 🍳 **Kitchen** (Cabinets & Countertops)
    4. 🪞 **Dressing Table** (Vanity Mirror & Organizers)
    5. 🗄️ **Drawer** (Pullout Shelves & Trays)
    6. 🖥️ **Study Desk** (Workstation & Monitor Rack)
    7. 📦 **Storage Box** (Bins, Totes & Containers)
    8. 🧭 **Other** (Reveals a custom detail input field for custom spots)
  - **Next / Store Action**: Validates input, saves to local storage, shows a celebratory toast notification, and updates counters.
- **Page 4 & 5: Sub-Location Selection & Photo Attachment**
  - **Contextual Sub-Location Options**: Custom presets for each main location (e.g. *Which drawer?*, *Which shelf?*).
  - **Location Photo Dropzone**: Optional photo capture of the exact nook or drawer.
  - **Custom Notes**: Optional descriptive tags for fast reference.

- **Page 6: Item Location Result (Saved Confirmation)** *(Reference Image 1)*
  - **Success Checkmark**: Vibrant purple celebration badge with spring animation.
  - **Item Summary Card**: Clean card displaying the item photo thumbnail and label.
  - **Horizontal Location Path Trail**: Step-by-step breadcrumb pill capsules with directional arrows (`[ Home ] → [ Bedroom ] → [ Dressing Table ] → [ Left Drawer ] → [ Small Organizer Box ] →`).
  - **Current Location Banner**: Gradient card with camera icon highlighting the full hierarchical path.
  - **Quick Actions**: `+ Add Another Item` (cycles back to store) and `✨ Decorate My Space` (launches AI space organizer).

- **Page 7: "Let's organize your space" (AI Space Organizer)** *(Reference Image 2)*
  - **Messy Space Photo Dropzone**: Drag & drop or upload photos of desks, rooms, or drawers for AI inspection.
  - **Choose Space Grid**: 8 clean cards with colorful themed icons (*Study Desk*, *Bedroom*, *Wardrobe*, *Dressing Table*, *Kitchen*, *Drawer*, *Storage Area*, *Other*).
  - **Custom Space Link**: Add custom zones with dedicated inputs.
  - **Next Navigation**: Smooth pill button with directional arrow.

- **Page 8: Add Dimensions (Optional)** *(Reference Image 3)*
  - **Measurement Fields**: Width, Length, and Height with embedded `cm` unit tags.
  - **Desk & Drawer Sub-Dimensions**: Optional desk depth and drawer height measurements for precision suggestions.
  - **Quick Skip**: *"I don't know the dimensions"* instant transition link.

- **Page 9: AI Analysis & Organization Plan** *(Reference Image 4)*
  - **Split View Layout**: Left shows the high-resolution uploaded room/desk visual; right displays the AI Organization Plan.
  - **5 Categorized Priority Recommendations**: Vibrant numbered circular badges with custom guidance:
    1. 🔴 **Frequently used items** — *Keep these within arm's reach.*
    2. 🟣 **Small items** — *Use a small organizer box.*
    3. 🔵 **Documents** — *Place vertically in a file holder.*
    4. 🟣 **Cables** — *Use cable clips and a cable box.*
    5. 🌸 **Rarely used items** — *Move to upper storage.*
  - **Apply & Organize Action**: Updates organized spaces metric counter and returns home with celebration toast.

---

---

## 🚀 How to Run the Project (Flask + SQLite)

This MCA project uses a **Flask backend with a persistent SQLite database (`household_items.db`)** and modern frontend.

### Recommended Method: Run with Flask Server
1. Open PowerShell or Command Prompt in the project folder:
   ```bash
   cd c:\Users\hp\OneDrive\Desktop\smartlocation
   ```
2. Start the application:
   ```bash
   python app.py
   ```
3. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

---

## 📁 File Structure

```
smartlocation/
│
├── app.py              # Flask backend server with REST API & SQLite persistence
├── household_items.db  # SQLite database storing household items and locations
├── uploads/            # Secure folder storing uploaded item photographs
├── index.html          # Semantic HTML markup (Home, Add Item, Search, Modals)
├── styles.css          # Glassmorphism design system, responsive rules, gradients
├── app.js              # Frontend client logic, API requests, search & view manager
├── README.md           # Documentation and run instructions
└── assets/             # Core icons and sample assets
```

---

## 🎨 Color Palette & Typography

- **Primary Purple:** `#7C3AED`, `#8B5CF6`, `#A855F7`
- **Accent Pink:** `#EC4899`, `#F472B6`, `#FCE7F3`
- **Soft Lavender:** `#EDE9FE`, `#DDD6FE`, `#F5F3FF`
- **Background:** Ambient soft gradient with frosted glass cards
- **Typography:** `Plus Jakarta Sans` & `Inter` (Google Fonts)
