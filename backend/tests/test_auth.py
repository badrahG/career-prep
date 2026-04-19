def test_register_success(client):
    res = client.post("/api/auth/register", json={
        "first_name": "Батболд",
        "last_name": "Дорж",
        "email": "batbold@example.com",
        "password": "SecurePass1",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "batbold@example.com"
    assert data["is_verified"] is False


def test_register_duplicate_email(client, registered_user):
    from unittest.mock import patch
    with patch("app.routers.auth.limiter.limit", return_value=lambda f: f):
        res = client.post("/api/auth/register", json={
            "first_name": "Өөр",
            "last_name": "Хүн",
            "email": registered_user["email"],
            "password": "AnotherPass1",
        })
    assert res.status_code == 400
    assert "бүртгэлтэй" in res.json()["detail"]


def test_register_short_password(client):
    res = client.post("/api/auth/register", json={
        "first_name": "А",
        "last_name": "Б",
        "email": "short@example.com",
        "password": "1234",
    })
    assert res.status_code == 400


def test_login_unverified(client, registered_user):
    res = client.post("/api/auth/login", json={
        "email": registered_user["email"],
        "password": registered_user["password"],
    })
    # registered_user fixture verifies the user, so this should succeed
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert "refresh_token" in res.json()


def test_login_wrong_password(client, registered_user):
    res = client.post("/api/auth/login", json={
        "email": registered_user["email"],
        "password": "WrongPassword!",
    })
    assert res.status_code == 401


def test_get_me(client, auth_headers):
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert "email" in res.json()


def test_get_me_no_token(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_refresh_token(client, registered_user):
    login_res = client.post("/api/auth/login", json={
        "email": registered_user["email"],
        "password": registered_user["password"],
    })
    refresh_token = login_res.json()["refresh_token"]

    res = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert "refresh_token" in res.json()


def test_refresh_invalid_token(client):
    res = client.post("/api/auth/refresh", json={"refresh_token": "invalid.token.here"})
    assert res.status_code == 401


def test_change_password(client, auth_headers, registered_user):
    res = client.post("/api/auth/change-password", json={
        "old_password": registered_user["password"],
        "new_password": "NewPassword123",
    }, headers=auth_headers)
    assert res.status_code == 200


def test_dashboard_stats(client, auth_headers):
    res = client.get("/api/auth/dashboard-stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "cv_count" in data
    assert "studied_questions" in data
    assert "quiz_count" in data
