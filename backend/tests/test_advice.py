"""Advice endpoint тестүүд."""
import pytest
from app.models.advice import Advice
from tests.conftest import TestingSession


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def test_advice():
    """Test DB-д нэг зөвлөмж үүсгэж, тест дууссаны дараа устгана."""
    db = TestingSession()
    a = Advice(
        title="Тест зөвлөмж",
        summary="CV бичих зөвлөмж хураангуй",
        content="CV бичих дэлгэрэнгүй зөвлөмж агуулга.",
        category="cv",
        is_published=True,
        sort_order=0,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    aid = a.id
    db.close()
    yield aid
    db = TestingSession()
    item = db.query(Advice).filter(Advice.id == aid).first()
    if item:
        db.delete(item)
        db.commit()
    db.close()


@pytest.fixture(scope="module")
def unpublished_advice():
    """Нийтлэгдээгүй зөвлөмж — нэвтрээгүй хэрэглэгчид харагдахгүй."""
    db = TestingSession()
    a = Advice(
        title="Нийтлэгдээгүй зөвлөмж",
        content="Нуугдмал агуулга.",
        category="career",
        is_published=False,
        sort_order=0,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    aid = a.id
    db.close()
    yield aid
    db = TestingSession()
    item = db.query(Advice).filter(Advice.id == aid).first()
    if item:
        db.delete(item)
        db.commit()
    db.close()


# ── Public list & stats ────────────────────────────────────────────────────────

def test_list_advice(client):
    res = client.get("/api/advice/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_list_advice_filter_cv(client, test_advice):
    res = client.get("/api/advice/?category=cv")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert any(a["title"] == "Тест зөвлөмж" for a in data)


def test_list_advice_filter_invalid_category(client):
    res = client.get("/api/advice/?category=invalid")
    assert res.status_code == 400


def test_advice_stats(client):
    res = client.get("/api/advice/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "cv" in data
    assert "interview" in data
    assert "job_search" in data
    assert "career" in data
    assert isinstance(data["total"], int)


# ── Get by id ─────────────────────────────────────────────────────────────────

def test_get_advice_by_id(client, test_advice):
    res = client.get(f"/api/advice/{test_advice}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == test_advice
    assert data["title"] == "Тест зөвлөмж"
    assert data["category"] == "cv"
    assert data["is_published"] is True


def test_get_advice_not_found(client):
    res = client.get("/api/advice/99999")
    assert res.status_code == 404


def test_get_unpublished_advice_hidden(client, unpublished_advice):
    # Нэвтрээгүй хэрэглэгч нийтлэгдээгүй зөвлөмжийг харж чадахгүй
    res = client.get(f"/api/advice/{unpublished_advice}")
    assert res.status_code == 404


# ── View count ─────────────────────────────────────────────────────────────────

def test_record_view_requires_auth(client, test_advice):
    res = client.post(f"/api/advice/{test_advice}/view")
    assert res.status_code == 401


def test_record_view(client, auth_headers, test_advice):
    res = client.post(f"/api/advice/{test_advice}/view", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["ok"] is True


def test_record_view_not_found(client, auth_headers):
    res = client.post("/api/advice/99999/view", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["ok"] is False  # 404 биш, {"ok": False} буцаана


# ── Admin-only endpoints (regular user → 403) ─────────────────────────────────

def test_create_advice_requires_admin(client, auth_headers):
    payload = {
        "category": "cv",
        "title": "Зөвшөөрөлгүй зөвлөмж",
        "content": "Агуулга",
        "is_published": True,
    }
    res = client.post("/api/advice/", json=payload, headers=auth_headers)
    assert res.status_code == 403


def test_update_advice_requires_admin(client, auth_headers, test_advice):
    payload = {
        "category": "cv",
        "title": "Өөрчилсөн гарчиг",
        "content": "Өөрчилсөн агуулга",
    }
    res = client.put(f"/api/advice/{test_advice}", json=payload, headers=auth_headers)
    assert res.status_code == 403


def test_delete_advice_requires_admin(client, auth_headers, test_advice):
    res = client.delete(f"/api/advice/{test_advice}", headers=auth_headers)
    assert res.status_code == 403
