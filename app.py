import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify, session, send_from_directory, render_template

import database
import ai_recognizer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ASSETS_FOLDER = os.path.join(BASE_DIR, 'assets')
INSTANCE_FOLDER = os.path.join(BASE_DIR, 'instance')
TEMPLATES_FOLDER = os.path.join(BASE_DIR, 'templates')
STATIC_FOLDER = os.path.join(BASE_DIR, 'static')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(INSTANCE_FOLDER, exist_ok=True)
os.makedirs(TEMPLATES_FOLDER, exist_ok=True)
os.makedirs(STATIC_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

app = Flask(
    __name__,
    template_folder=BASE_DIR,
    static_folder=BASE_DIR,
    static_url_path=''
)
app.secret_key = os.environ.get('SECRET_KEY', 'smart-space-organizer-secret-key-2026')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32 MB max upload
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Initialize SQLite database on startup
database.init_db()


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_current_user_id():
    """
    Returns the logged-in user's ID from session.
    If not logged in, defaults to user ID 1 (alex/demo) to allow guest exploration,
    while registered users get their own isolated accounts.
    """
    return session.get('user_id', 1)


# -----------------------------------------------------------------------------
# Static and Page Routes
# -----------------------------------------------------------------------------

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route('/assets/<path:filename>')
def serve_asset(filename):
    return send_from_directory(ASSETS_FOLDER, filename)


@app.route('/styles.css')
def serve_styles():
    return send_from_directory(BASE_DIR, 'styles.css')


@app.route('/app.js')
def serve_js():
    return send_from_directory(BASE_DIR, 'app.js')


# -----------------------------------------------------------------------------
# PART 6 — AUTHENTICATION API ROUTES
# -----------------------------------------------------------------------------

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json(silent=True) or request.form
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not username or not email or not password:
        return jsonify({"status": "error", "message": "Username, email, and password are required."}), 400

    try:
        user = database.register_user(username, email, password)
        session['user_id'] = user['id']
        session['username'] = user['username']
        return jsonify({
            "status": "success",
            "message": f"Welcome, {username}! Account created successfully.",
            "user": user
        }), 201
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        app.logger.error(f"Registration error: {e}")
        return jsonify({"status": "error", "message": "Failed to create account. Please try again."}), 500


@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json(silent=True) or request.form
    identifier = data.get('username') or data.get('email') or data.get('identifier', '')
    password = data.get('password', '').strip()

    if not identifier or not password:
        return jsonify({"status": "error", "message": "Please enter your username/email and password."}), 400

    user = database.authenticate_user(identifier, password)
    if not user:
        return jsonify({"status": "error", "message": "Invalid username or password."}), 401

    session['user_id'] = user['id']
    session['username'] = user['username']
    return jsonify({
        "status": "success",
        "message": f"Welcome back, {user['username']}!",
        "user": user
    })


@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({
        "status": "success",
        "message": "Logged out successfully."
    })


@app.route('/api/auth/me', methods=['GET'])
def api_auth_me():
    user_id = session.get('user_id')
    if not user_id:
        # Default guest session for alex
        user = database.get_user_by_id(1)
        return jsonify({"authenticated": False, "user": user})
    
    user = database.get_user_by_id(user_id)
    if not user:
        session.clear()
        return jsonify({"authenticated": False, "user": None})
    return jsonify({"authenticated": True, "user": user})


# -----------------------------------------------------------------------------
# PART 6 — ROOMS API ROUTES
# -----------------------------------------------------------------------------

@app.route('/api/rooms', methods=['GET'])
def api_get_rooms():
    user_id = get_current_user_id()
    rooms = database.get_user_rooms(user_id)
    return jsonify(rooms)


@app.route('/api/rooms', methods=['POST'])
def api_create_room():
    user_id = get_current_user_id()
    data = request.get_json(silent=True) or request.form
    room_name = data.get('room_name', '').strip()
    description = data.get('description', '').strip()

    if not room_name:
        return jsonify({"status": "error", "message": "Room name is required."}), 400

    try:
        room = database.create_user_room(user_id, room_name, description)
        return jsonify({
            "status": "success",
            "message": f"Room '{room_name}' created successfully.",
            "room": room
        }), 201
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400


# -----------------------------------------------------------------------------
# PART 6 — LOCATIONS API ROUTES
# -----------------------------------------------------------------------------

@app.route('/api/locations', methods=['GET'])
def api_get_locations():
    user_id = get_current_user_id()
    room_id = request.args.get('room_id')
    try:
        room_id_int = int(room_id) if room_id else None
    except ValueError:
        room_id_int = None

    locations = database.get_user_locations(user_id, room_id_int)
    return jsonify(locations)


@app.route('/api/locations', methods=['POST'])
def api_create_location():
    user_id = get_current_user_id()
    data = request.get_json(silent=True) or request.form
    room_id = data.get('room_id')
    location_name = data.get('location_name', '').strip()
    description = data.get('description', '').strip()

    if not room_id or not location_name:
        return jsonify({"status": "error", "message": "Room ID and location name are required."}), 400

    try:
        loc = database.create_user_location(user_id, int(room_id), location_name, description)
        return jsonify({
            "status": "success",
            "message": f"Storage location '{location_name}' created successfully.",
            "location": loc
        }), 201
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400


# -----------------------------------------------------------------------------
# PART 6 — OBJECTS API ROUTES
# -----------------------------------------------------------------------------

@app.route('/api/objects', methods=['GET'])
def api_get_objects():
    user_id = get_current_user_id()
    query = request.args.get('q', None)
    objects = database.get_user_objects(user_id, search_query=query)
    return jsonify(objects)


@app.route('/api/objects/search', methods=['GET'])
def api_search_objects():
    user_id = get_current_user_id()
    query = request.args.get('q', '').strip()
    objects = database.get_user_objects(user_id, search_query=query)
    return jsonify(objects)


@app.route('/api/objects/<int:object_id>', methods=['GET'])
def api_get_object(object_id):
    user_id = get_current_user_id()
    obj = database.get_user_object(object_id, user_id)
    if not obj:
        return jsonify({"status": "error", "message": "Object not found."}), 404
    return jsonify(obj)


@app.route('/api/objects', methods=['POST'])
def api_create_object():
    user_id = get_current_user_id()
    image_path = None

    # Handle image upload if present
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            safe_name = f"{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}.{ext}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], safe_name)
            file.save(filepath)
            image_path = f"/uploads/{safe_name}"

    # Parameters can come from multipart form or JSON
    if request.is_json:
        data = request.get_json() or {}
        object_name = data.get('object_name', '').strip()
        room_id = data.get('room_id')
        location_id = data.get('location_id')
        description = data.get('description', '').strip()
        if not image_path and data.get('image_path'):
            image_path = data.get('image_path')
    else:
        object_name = request.form.get('object_name', '').strip()
        room_id = request.form.get('room_id')
        location_id = request.form.get('location_id')
        description = request.form.get('description', '').strip()
        if not image_path and request.form.get('image_path'):
            image_path = request.form.get('image_path')

    if not object_name:
        return jsonify({"status": "error", "message": "Object name is required."}), 400

    # Auto-link or create room if passed as string name
    room_id_val = None
    if room_id:
        try:
            room_id_val = int(room_id)
        except ValueError:
            # Create room by string name if needed
            room_obj = database.create_user_room(user_id, str(room_id))
            room_id_val = room_obj["id"]

    location_id_val = None
    if location_id:
        try:
            location_id_val = int(location_id)
        except ValueError:
            # Create location under room
            if room_id_val:
                loc_obj = database.create_user_location(user_id, room_id_val, str(location_id))
                location_id_val = loc_obj["id"]

    try:
        new_obj = database.create_user_object(
            user_id=user_id,
            object_name=object_name,
            image_path=image_path,
            room_id=room_id_val,
            location_id=location_id_val,
            description=description
        )
        return jsonify({
            "status": "success",
            "message": f"'{object_name}' saved successfully in {new_obj['full_location_path']}.",
            "object": new_obj
        }), 201
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route('/api/objects/<int:object_id>', methods=['PUT'])
def api_update_object(object_id):
    user_id = get_current_user_id()
    new_image_path = None

    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            safe_name = f"{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}.{ext}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], safe_name)
            file.save(filepath)
            new_image_path = f"/uploads/{safe_name}"

    if request.is_json:
        data = request.get_json() or {}
        object_name = data.get('object_name', '').strip()
        room_id = data.get('room_id')
        location_id = data.get('location_id')
        description = data.get('description', '').strip()
        if not new_image_path and 'image_path' in data:
            new_image_path = data.get('image_path')
    else:
        object_name = request.form.get('object_name', '').strip()
        room_id = request.form.get('room_id')
        location_id = request.form.get('location_id')
        description = request.form.get('description', '').strip()
        if not new_image_path and 'image_path' in request.form:
            new_image_path = request.form.get('image_path')

    if not object_name:
        return jsonify({"status": "error", "message": "Object name cannot be empty."}), 400

    room_id_val = int(room_id) if room_id else None
    location_id_val = int(location_id) if location_id else None

    try:
        updated = database.update_user_object(
            object_id=object_id,
            user_id=user_id,
            object_name=object_name,
            image_path=new_image_path,
            room_id=room_id_val,
            location_id=location_id_val,
            description=description
        )
        if not updated:
            return jsonify({"status": "error", "message": "Object not found or unauthorized."}), 404
        return jsonify({
            "status": "success",
            "message": f"'{object_name}' updated successfully.",
            "object": updated
        })
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route('/api/objects/<int:object_id>', methods=['DELETE'])
def api_delete_object(object_id):
    user_id = get_current_user_id()
    deleted = database.delete_user_object(object_id, user_id)
    if not deleted:
        return jsonify({"status": "error", "message": "Object not found or unauthorized."}), 404

    # Clean up uploaded file if local
    img_path = deleted.get("image_path")
    if img_path and img_path.startswith('/uploads/'):
        local_path = os.path.join(BASE_DIR, img_path.lstrip('/'))
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception as e:
                app.logger.warning(f"Could not delete image file {local_path}: {e}")

    return jsonify({
        "status": "success",
        "message": f"'{deleted['object_name']}' deleted successfully."
    })


# -----------------------------------------------------------------------------
# PART 6 & 7 — DASHBOARD STATS & AI RECOGNITION
# -----------------------------------------------------------------------------

@app.route('/api/dashboard/stats', methods=['GET'])
def api_dashboard_stats():
    user_id = get_current_user_id()
    stats = database.get_dashboard_stats(user_id)
    return jsonify(stats)


@app.route('/api/ai/recognize', methods=['POST'])
def api_ai_recognize():
    """
    Accepts an uploaded image file and returns visual recognition predictions
    using the pretrained MobileNetV3 model.
    """
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "No image file provided."}), 400

    file = request.files['image']
    if not file or not file.filename:
        return jsonify({"status": "error", "message": "Empty image uploaded."}), 400

    if not allowed_file(file.filename):
        return jsonify({"status": "error", "message": "Unsupported file format. Please upload JPG, PNG, or WEBP."}), 400

    try:
        # Save temp image for processing
        ext = file.filename.rsplit('.', 1)[1].lower()
        temp_name = f"temp_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:6]}.{ext}"
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], temp_name)
        file.save(temp_path)

        # Run AI visual recognition
        recognition_result = ai_recognizer.recognize_object_from_image(temp_path)
        recognition_result["uploaded_image_url"] = f"/uploads/{temp_name}"
        return jsonify(recognition_result)
    except Exception as e:
        app.logger.error(f"AI Recognition Error: {e}")
        return jsonify({
            "status": "error",
            "message": f"Image recognition failed: {str(e)}"
        }), 500


# -----------------------------------------------------------------------------
# Backward-compatibility routes for existing frontend bindings
# -----------------------------------------------------------------------------

@app.route('/api/items', methods=['GET', 'POST'])
def compat_items():
    if request.method == 'POST':
        return api_create_object()
    return api_get_objects()


@app.route('/api/items/<int:item_id>', methods=['GET', 'PUT', 'DELETE'])
def compat_item_detail(item_id):
    if request.method == 'PUT':
        return api_update_object(item_id)
    elif request.method == 'DELETE':
        return api_delete_object(item_id)
    return api_get_object(item_id)


@app.route('/api/stats', methods=['GET'])
def compat_stats():
    return api_dashboard_stats()


if __name__ == '__main__':
    print("==================================================")
    print(" Smart Space Organizer - Flask Backend Server")
    print(f" Database: {database.DB_PATH}")
    print(f" Uploads: {UPLOAD_FOLDER}")
    print(" Localhost URL: http://127.0.0.1:5000")
    print("==================================================")
    app.run(debug=True, host='127.0.0.1', port=5000)
