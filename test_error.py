import requests

BASE_URL = "http://localhost:8000"

# 1. Signup user
signup_data = {
    "email": "test_follower@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "Follower"
}
res = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)

# 2. Login
login_data = {
    "username": "test_follower@example.com",
    "password": "password123"
}
res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
token = res.json().get("access_token")

if not token:
    print("Login failed:", res.text)
    exit(1)

# 3. Try to follow user 3
headers = {"Authorization": f"Bearer {token}"}
res = requests.post(f"{BASE_URL}/users/3/follow", headers=headers)
print("Status:", res.status_code)
print("Response:", res.text)
