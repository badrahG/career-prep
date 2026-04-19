import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch

from app.database import Base, get_db
from app.main import app

TEST_DB_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

TEST_USER = {
    "first_name": "Тест",
    "last_name": "Хэрэглэгч",
    "email": "testuser@example.com",
    "password": "Password123",
}


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    import os, time
    for _ in range(3):
        try:
            if os.path.exists("test.db"):
                os.remove("test.db")
            break
        except PermissionError:
            time.sleep(0.5)


@pytest.fixture(scope="session")
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def registered_user(client):
    with patch("app.services.rate_limit.limiter.limit", return_value=lambda f: f):
        client.post("/api/auth/register", json=TEST_USER)

    db = TestingSession()
    from app.models.user import User
    user = db.query(User).filter(User.email == TEST_USER["email"]).first()
    if user:
        user.is_verified = True
        db.commit()
    db.close()
    return TEST_USER


@pytest.fixture(scope="session")
def auth_headers(client, registered_user):
    res = client.post("/api/auth/login", json={
        "email": registered_user["email"],
        "password": registered_user["password"],
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
