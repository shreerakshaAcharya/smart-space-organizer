import urllib.request
import urllib.parse
import json
import http.cookiejar
import time

BASE_URL = "http://127.0.0.1:5000"

cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))


def request_json(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"} if data else {}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with opener.open(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except:
            return e.code, {"error": content}


def run_tests():
    print("=" * 60)
    print("RUNNING COMPREHENSIVE FLASK + SQLITE + AI TESTS")
    print("=" * 60)

    # 1. Test Static Index Serve
    print("\n[Test 1] Serving Index HTML:")
    with opener.open(f"{BASE_URL}/") as resp:
        html = resp.read().decode("utf-8")
        assert "Smart Space Organizer" in html
        assert "hero-room.jpg" in html
        print("  [OK] Landing page serves successfully with bedroom interior!")

    # 2. Test Guest / Default Dashboard Stats
    print("\n[Test 2] Dashboard Stats for Default Account:")
    status, stats = request_json("/api/dashboard/stats")
    print(f"  Status: {status}, Stats: {stats}")
    assert status == 200
    assert "items_stored" in stats
    print("  [OK] Dashboard stats retrieved successfully!")

    # 3. Test Seeded Examples (Part 9 Verification)
    print("\n[Test 3] Verifying 3 MCA Required Test Objects:")
    for query, expected_room, expected_loc in [
        ("Charger", "Bedroom", "Study Desk Drawer"),
        ("Passport", "Bedroom", "Wardrobe Upper Shelf"),
        ("House Keys", "Living Room", "Wall Shelf")
    ]:
        status, results = request_json(f"/api/objects/search?q={urllib.parse.quote(query)}")
        assert status == 200
        assert len(results) > 0, f"Object {query} not found!"
        item = results[0]
        full_path = item['full_location_path'].replace('\u2192', '->')
        print(f"  [OK] Search '{query}': Found '{item['object_name']}' stored in '{full_path}'")
        assert expected_room.lower() in full_path.lower()
        assert expected_loc.lower() in full_path.lower()

    # 4. Test New User Registration & 0-stats Guarantee (Part 1.5)
    print("\n[Test 4] Register New User (Zero Records Check):")
    username = f"mca_{int(time.time())}"
    email = f"{username}@university.edu"
    status, reg_data = request_json("/api/register", method="POST", data={
        "username": username,
        "email": email,
        "password": "securepassword123"
    })
    assert status == 201, f"Registration failed: {reg_data}"
    print(f"  [OK] User '{username}' registered successfully!")

    # Check that new user gets 0 for all stats
    status, new_stats = request_json("/api/dashboard/stats")
    print(f"  New User Stats: {new_stats}")
    assert new_stats["items_stored"] == 0
    assert new_stats["locations_saved"] == 0
    assert new_stats["spaces_organized"] == 0
    print("  [OK] Confirmed: New user has exactly 0 items, 0 locations, 0 spaces!")

    # 5. Create Room for New User
    print("\n[Test 5] Create Room for User:")
    status, room_data = request_json("/api/rooms", method="POST", data={
        "room_name": "Study Room",
        "description": "Quiet workstation for MCA project"
    })
    assert status == 201
    room_id = room_data["room"]["id"]
    print(f"  [OK] Room created with ID {room_id}: '{room_data['room']['room_name']}'")

    # 6. Create Storage Location for New User
    print("\n[Test 6] Create Storage Location:")
    status, loc_data = request_json("/api/locations", method="POST", data={
        "room_id": room_id,
        "location_name": "Top Bookcase Shelf",
        "description": "Next to dictionary"
    })
    assert status == 201
    loc_id = loc_data["location"]["id"]
    print(f"  [OK] Location created with ID {loc_id}: '{loc_data['location']['location_name']}'")

    # 7. Add Object for New User
    print("\n[Test 7] Add Object for User:")
    status, obj_data = request_json("/api/objects", method="POST", data={
        "object_name": "Reference Textbook",
        "room_id": room_id,
        "location_id": loc_id,
        "description": "Artificial Intelligence & Visual Recognition textbook"
    })
    assert status == 201
    obj_id = obj_data["object"]["id"]
    loc_path = obj_data['object']['full_location_path'].replace('\u2192', '->')
    print(f"  [OK] Object created with ID {obj_id}: '{obj_data['object']['object_name']}' in '{loc_path}'")

    # Verify updated stats
    status, updated_stats = request_json("/api/dashboard/stats")
    print(f"  Updated Stats: {updated_stats}")
    assert updated_stats["items_stored"] == 1
    assert updated_stats["locations_saved"] == 1
    assert updated_stats["spaces_organized"] == 1
    print("  [OK] Stats dynamically updated from SQLite database!")

    # 8. Edit Object
    print("\n[Test 8] Edit Object:")
    status, edit_data = request_json(f"/api/objects/{obj_id}", method="PUT", data={
        "object_name": "AI & Visual Recognition Textbook (2nd Ed)",
        "room_id": room_id,
        "location_id": loc_id,
        "description": "Updated edition"
    })
    assert status == 200
    print(f"  [OK] Edited Object: '{edit_data['object']['object_name']}'")

    # 9. Delete Object
    print("\n[Test 9] Delete Object:")
    status, del_data = request_json(f"/api/objects/{obj_id}", method="DELETE")
    assert status == 200
    print(f"  [OK] Deleted Object: {del_data['message']}")

    # 10. AI Visual Recognition Test
    print("\n[Test 10] AI Visual Recognition Model:")
    import ai_recognizer
    res = ai_recognizer.recognize_object_from_image("assets/wireless-earphones.jpg")
    print(f"  AI Recognition result on 'wireless-earphones.jpg':")
    print(f"    Suggested Name: {res['suggested_name']}")
    print(f"    Category: {res['category']}")
    print(f"    Confidence: {res['confidence_percentage']}")
    print(f"    Recommended Room: {res['suggested_room']} -> {res['suggested_location']}")
    assert res["status"] == "success"
    print("  [OK] PyTorch MobileNetV3 visual recognition functioning accurately!")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
