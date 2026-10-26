import os
import sqlite3
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
os.makedirs(INSTANCE_DIR, exist_ok=True)
DB_PATH = os.path.join(INSTANCE_DIR, 'smart_space.db')


def get_db():
    """Returns a SQLite connection with foreign keys enabled and row_factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    """Initializes tables, constraints, indexes and default seed data."""
    conn = get_db()
    cursor = conn.cursor()

    # 1. Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL COLLATE NOCASE,
            email TEXT UNIQUE NOT NULL COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Rooms table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            room_name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 3. Locations table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            location_name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
        )
    """)

    # 4. Objects table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS objects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            object_name TEXT NOT NULL,
            image_path TEXT,
            room_id INTEGER,
            location_id INTEGER,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
            FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
        )
    """)

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_objects_user ON objects(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_objects_name ON objects(object_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_rooms_user ON rooms(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_locations_room ON locations(room_id);")

    conn.commit()

    # Seed default demo account and initial MCA test data if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        seed_default_data(cursor, conn)

    conn.close()


def seed_default_data(cursor, conn):
    """Seeds demo user and initial rooms/locations/objects for testing."""
    hashed_pwd = generate_password_hash("password123")
    
    # Create demo user and alex
    cursor.execute("""
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
    """, ("alex", "alex@smartspace.io", hashed_pwd))
    alex_id = cursor.lastrowid

    cursor.execute("""
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
    """, ("demo", "demo@smartspace.io", hashed_pwd))
    demo_id = cursor.lastrowid

    # Add default rooms for alex
    rooms_data = [
        (alex_id, "Bedroom", "Cozy personal space and sleeping area"),
        (alex_id, "Living Room", "Main lounge, TV and entertainment area"),
        (alex_id, "Kitchen", "Cooking, dining, and food storage"),
        (alex_id, "Study Desk", "Home office workstation and electronics")
    ]
    cursor.executemany("""
        INSERT INTO rooms (user_id, room_name, description)
        VALUES (?, ?, ?)
    """, rooms_data)

    cursor.execute("SELECT id, room_name FROM rooms WHERE user_id = ?", (alex_id,))
    room_map = {row["room_name"]: row["id"] for row in cursor.fetchall()}

    # Add locations for alex
    locs_data = [
        (room_map.get("Bedroom"), "Study Desk Drawer", "Left pullout drawer underneath desk surface"),
        (room_map.get("Bedroom"), "Wardrobe Upper Shelf", "Top storage shelf above hanging rack"),
        (room_map.get("Bedroom"), "Nightstand Table", "Right beside bed with lamp"),
        (room_map.get("Living Room"), "Wall Shelf", "Floating oak shelf near entrance"),
        (room_map.get("Living Room"), "TV Cabinet", "Lower glass media console"),
        (room_map.get("Kitchen"), "Countertop Rack", "Next to espresso machine"),
        (room_map.get("Study Desk"), "Cable Organizer Box", "Underneath monitor stand")
    ]
    cursor.executemany("""
        INSERT INTO locations (room_id, location_name, description)
        VALUES (?, ?, ?)
    """, locs_data)

    cursor.execute("""
        SELECT l.id, l.location_name, r.room_name 
        FROM locations l 
        JOIN rooms r ON l.room_id = r.id 
        WHERE r.user_id = ?
    """, (alex_id,))
    loc_rows = cursor.fetchall()
    loc_map = {(row["room_name"], row["location_name"]): row["id"] for row in loc_rows}

    # Seed the 3 required test examples from Part 9 for alex:
    # Example 1: Laptop Charger -> Bedroom -> Study Desk Drawer
    # Example 2: Passport -> Bedroom -> Wardrobe Upper Shelf
    # Example 3: House Keys -> Living Room -> Wall Shelf
    charger_loc_id = loc_map.get(("Bedroom", "Study Desk Drawer"))
    passport_loc_id = loc_map.get(("Bedroom", "Wardrobe Upper Shelf"))
    keys_loc_id = loc_map.get(("Living Room", "Wall Shelf"))

    test_objects = [
        (alex_id, "Laptop Charger", "/assets/card-bedroom.jpg", room_map.get("Bedroom"), charger_loc_id, "65W USB-C fast charger for MacBook and work laptop"),
        (alex_id, "Passport", "/assets/card-wardrobe.jpg", room_map.get("Bedroom"), passport_loc_id, "International passport inside blue RFID waterproof sleeve"),
        (alex_id, "House Keys", "/assets/card-drawer.jpg", room_map.get("Living Room"), keys_loc_id, "Main brass house keys with security fob")
    ]
    cursor.executemany("""
        INSERT INTO objects (user_id, object_name, image_path, room_id, location_id, description)
        VALUES (?, ?, ?, ?, ?, ?)
    """, test_objects)

    conn.commit()


# -----------------------------------------------------------------------------
# User Authentication Helpers
# -----------------------------------------------------------------------------

def register_user(username, email, password):
    """Registers a new user with secure password hashing. Returns user dict or raises ValueError."""
    username = username.strip()
    email = email.strip().lower()
    if not username or not email or not password:
        raise ValueError("Username, email, and password are required.")
    if len(password) < 4:
        raise ValueError("Password must be at least 4 characters long.")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
    if cursor.fetchone():
        conn.close()
        raise ValueError("A user with this username or email already exists.")

    pwd_hash = generate_password_hash(password)
    cursor.execute("""
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
    """, (username, email, pwd_hash))
    conn.commit()
    user_id = cursor.lastrowid

    cursor.execute("SELECT id, username, email, created_at FROM users WHERE id = ?", (user_id,))
    user = dict(cursor.fetchone())
    conn.close()
    return user


def authenticate_user(identifier, password):
    """Verifies credentials by username or email. Returns user dict without hash or None."""
    identifier = identifier.strip().lower()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, username, email, password_hash, created_at 
        FROM users 
        WHERE LOWER(username) = ? OR LOWER(email) = ?
    """, (identifier, identifier))
    row = cursor.fetchone()
    conn.close()

    if row and check_password_hash(row["password_hash"], password):
        return {
            "id": row["id"],
            "username": row["username"],
            "email": row["email"],
            "created_at": row["created_at"]
        }
    return None


def get_user_by_id(user_id):
    """Fetches user public profile by ID."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


# -----------------------------------------------------------------------------
# Rooms Helpers
# -----------------------------------------------------------------------------

def get_user_rooms(user_id):
    """Returns all rooms created by or available to the user."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.room_name, r.description, r.created_at,
               COUNT(DISTINCT l.id) AS locations_count,
               COUNT(DISTINCT o.id) AS objects_count
        FROM rooms r
        LEFT JOIN locations l ON l.room_id = r.id
        LEFT JOIN objects o ON o.room_id = r.id
        WHERE r.user_id = ?
        GROUP BY r.id
        ORDER BY r.room_name ASC
    """, (user_id,))
    rooms = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rooms


def create_user_room(user_id, room_name, description=""):
    """Creates a new room for the user."""
    room_name = room_name.strip()
    if not room_name:
        raise ValueError("Room name cannot be empty.")
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO rooms (user_id, room_name, description)
        VALUES (?, ?, ?)
    """, (user_id, room_name, description.strip() if description else ""))
    conn.commit()
    new_id = cursor.lastrowid

    cursor.execute("SELECT id, room_name, description, created_at FROM rooms WHERE id = ?", (new_id,))
    room = dict(cursor.fetchone())
    conn.close()
    return room


# -----------------------------------------------------------------------------
# Locations Helpers
# -----------------------------------------------------------------------------

def get_user_locations(user_id, room_id=None):
    """Returns storage locations for the user, optionally filtered by room."""
    conn = get_db()
    cursor = conn.cursor()

    if room_id:
        cursor.execute("""
            SELECT l.id, l.room_id, l.location_name, l.description, l.created_at,
                   r.room_name
            FROM locations l
            JOIN rooms r ON l.room_id = r.id
            WHERE r.user_id = ? AND l.room_id = ?
            ORDER BY l.location_name ASC
        """, (user_id, room_id))
    else:
        cursor.execute("""
            SELECT l.id, l.room_id, l.location_name, l.description, l.created_at,
                   r.room_name
            FROM locations l
            JOIN rooms r ON l.room_id = r.id
            WHERE r.user_id = ?
            ORDER BY r.room_name ASC, l.location_name ASC
        """, (user_id,))

    locations = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return locations


def create_user_location(user_id, room_id, location_name, description=""):
    """Creates a storage location inside one of user's rooms."""
    location_name = location_name.strip()
    if not location_name:
        raise ValueError("Location name is required.")
    
    conn = get_db()
    cursor = conn.cursor()

    # Validate room ownership
    cursor.execute("SELECT id FROM rooms WHERE id = ? AND user_id = ?", (room_id, user_id))
    if not cursor.fetchone():
        conn.close()
        raise ValueError("Room not found or unauthorized.")

    cursor.execute("""
        INSERT INTO locations (room_id, location_name, description)
        VALUES (?, ?, ?)
    """, (room_id, location_name, description.strip() if description else ""))
    conn.commit()
    new_id = cursor.lastrowid

    cursor.execute("""
        SELECT l.id, l.room_id, l.location_name, l.description, l.created_at, r.room_name
        FROM locations l
        JOIN rooms r ON l.room_id = r.id
        WHERE l.id = ?
    """, (new_id,))
    location = dict(cursor.fetchone())
    conn.close()
    return location


# -----------------------------------------------------------------------------
# Objects Helpers
# -----------------------------------------------------------------------------

def get_user_objects(user_id, search_query=None):
    """Retrieves objects belonging to user with room & location details."""
    conn = get_db()
    cursor = conn.cursor()

    base_query = """
        SELECT o.id, o.user_id, o.object_name, o.image_path, o.room_id, o.location_id,
               o.description, o.created_at, o.updated_at,
               COALESCE(r.room_name, 'Unassigned') AS room_name,
               COALESCE(l.location_name, 'General Area') AS location_name,
               CASE 
                 WHEN r.room_name IS NOT NULL AND l.location_name IS NOT NULL THEN r.room_name || ' → ' || l.location_name
                 WHEN r.room_name IS NOT NULL THEN r.room_name
                 ELSE 'General Storage'
               END AS full_location_path
        FROM objects o
        LEFT JOIN rooms r ON o.room_id = r.id
        LEFT JOIN locations l ON o.location_id = l.id
        WHERE o.user_id = ?
    """

    if search_query:
        pattern = f"%{search_query.strip()}%"
        cursor.execute(base_query + """
            AND (
                o.object_name LIKE ? COLLATE NOCASE
                OR r.room_name LIKE ? COLLATE NOCASE
                OR l.location_name LIKE ? COLLATE NOCASE
                OR o.description LIKE ? COLLATE NOCASE
            )
            ORDER BY o.id DESC
        """, (user_id, pattern, pattern, pattern, pattern))
    else:
        cursor.execute(base_query + " ORDER BY o.id DESC", (user_id,))

    objects = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return objects


def get_user_object(object_id, user_id):
    """Retrieves single object belonging to user."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT o.id, o.user_id, o.object_name, o.image_path, o.room_id, o.location_id,
               o.description, o.created_at, o.updated_at,
               COALESCE(r.room_name, 'Unassigned') AS room_name,
               COALESCE(l.location_name, 'General Area') AS location_name,
               CASE 
                 WHEN r.room_name IS NOT NULL AND l.location_name IS NOT NULL THEN r.room_name || ' → ' || l.location_name
                 WHEN r.room_name IS NOT NULL THEN r.room_name
                 ELSE 'General Storage'
               END AS full_location_path
        FROM objects o
        LEFT JOIN rooms r ON o.room_id = r.id
        LEFT JOIN locations l ON o.location_id = l.id
        WHERE o.id = ? AND o.user_id = ?
    """, (object_id, user_id))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def create_user_object(user_id, object_name, image_path, room_id, location_id, description=""):
    """Inserts a new object record into database."""
    object_name = object_name.strip()
    if not object_name:
        raise ValueError("Object name is required.")

    conn = get_db()
    cursor = conn.cursor()

    # Verify room ownership if provided
    if room_id:
        cursor.execute("SELECT id FROM rooms WHERE id = ? AND user_id = ?", (room_id, user_id))
        if not cursor.fetchone():
            conn.close()
            raise ValueError("Invalid room selected.")

    # Verify location belongs to room if provided
    if location_id:
        cursor.execute("""
            SELECT l.id FROM locations l 
            JOIN rooms r ON l.room_id = r.id 
            WHERE l.id = ? AND r.user_id = ?
        """, (location_id, user_id))
        if not cursor.fetchone():
            conn.close()
            raise ValueError("Invalid location selected.")

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO objects (user_id, object_name, image_path, room_id, location_id, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, object_name, image_path, room_id, location_id, description.strip() if description else "", now, now))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return get_user_object(new_id, user_id)


def update_user_object(object_id, user_id, object_name, image_path, room_id, location_id, description=""):
    """Updates existing object in database."""
    object_name = object_name.strip()
    if not object_name:
        raise ValueError("Object name cannot be empty.")

    existing = get_user_object(object_id, user_id)
    if not existing:
        return None

    final_image = image_path if image_path is not None else existing["image_path"]

    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        UPDATE objects
        SET object_name = ?, image_path = ?, room_id = ?, location_id = ?, description = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
    """, (object_name, final_image, room_id, location_id, description.strip() if description else "", now, object_id, user_id))
    conn.commit()
    conn.close()

    return get_user_object(object_id, user_id)


def delete_user_object(object_id, user_id):
    """Deletes an object from database and returns its image_path if any."""
    existing = get_user_object(object_id, user_id)
    if not existing:
        return None

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM objects WHERE id = ? AND user_id = ?", (object_id, user_id))
    conn.commit()
    conn.close()

    return existing


# -----------------------------------------------------------------------------
# Dashboard Statistics
# -----------------------------------------------------------------------------

def get_dashboard_stats(user_id):
    """
    Returns dynamic metrics for a user:
    - Items Stored (total objects)
    - Locations Saved (total distinct storage locations saved)
    - Spaces Organized (total rooms created and organized)
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM objects WHERE user_id = ?", (user_id,))
    total_items = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(DISTINCT l.id)
        FROM locations l
        JOIN rooms r ON l.room_id = r.id
        WHERE r.user_id = ?
    """, (user_id,))
    total_locations = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM rooms WHERE user_id = ?", (user_id,))
    total_spaces = cursor.fetchone()[0]

    conn.close()

    return {
        "items_stored": total_items,
        "locations_saved": total_locations,
        "spaces_organized": total_spaces
    }
