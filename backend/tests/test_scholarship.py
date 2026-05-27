"""Scholarship endpoint тестүүд."""
import pytest
from app.models.scholarship import Scholarship
from tests.conftest import TestingSession


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def test_scholarship():
    """Test DB-д нэг тэтгэлэг үүсгэж, тест дууссаны дараа устгана."""
    db = TestingSession()
    s = Scholarship(
        name="Тест тэтгэлэг",
        organization="МУИС",
        target="Бакалавр",
        description="Тест тэтгэлгийн тайлбар",
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    sid = s.id
    db.close()
    yield sid
    db = TestingSession()
    item = db.query(Scholarship).filter(Scholarship.id == sid).first()
    if item:
        db.delete(item)
        db.commit()
    db.close()


# ── Public endpoints ───────────────────────────────────────────────────────────

def test_get_scholarships(client):
    res = client.get("/api/scholarship")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_scholarships_filter_target(client, test_scholarship):
    res = client.get("/api/scholarship?target=Бакалавр")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert any(s["name"] == "Тест тэтгэлэг" for s in data)


def test_get_scholarship_by_id(client, test_scholarship):
    res = client.get(f"/api/scholarship/{test_scholarship}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == test_scholarship
    assert data["name"] == "Тест тэтгэлэг"
    assert data["organization"] == "МУИС"


def test_get_scholarship_not_found(client):
    res = client.get("/api/scholarship/99999")
    assert res.status_code == 404


# ── Bookmark endpoints ─────────────────────────────────────────────────────────

def test_get_bookmarks_requires_auth(client):
    res = client.get("/api/scholarship/bookmarks")
    assert res.status_code == 401


def test_get_bookmarks(client, auth_headers):
    res = client.get("/api/scholarship/bookmarks", headers=auth_headers)
    assert res.status_code == 200
    assert "ids" in res.json()
    assert isinstance(res.json()["ids"], list)


def test_toggle_bookmark_add(client, auth_headers, test_scholarship):
    res = client.post(f"/api/scholarship/{test_scholarship}/bookmark", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["bookmarked"] is True


def test_toggle_bookmark_remove(client, auth_headers, test_scholarship):
    # Өмнөх тестээс bookmark нэмэгдсэн — дахин дарвал хасагдана
    res = client.post(f"/api/scholarship/{test_scholarship}/bookmark", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["bookmarked"] is False


def test_toggle_bookmark_not_found(client, auth_headers):
    res = client.post("/api/scholarship/99999/bookmark", headers=auth_headers)
    assert res.status_code == 404


# ── Checklist endpoints ────────────────────────────────────────────────────────

def test_get_checklist_empty(client, auth_headers, test_scholarship):
    res = client.get(f"/api/scholarship/{test_scholarship}/checklist", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["items"] is None


def test_save_checklist(client, auth_headers, test_scholarship):
    items = [
        {"label": "CV бэлдэх", "done": False},
        {"label": "Анкет бөглөх", "done": True},
    ]
    res = client.put(
        f"/api/scholarship/{test_scholarship}/checklist",
        json={"items": items},
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.json()["ok"] is True


def test_get_checklist_saved(client, auth_headers, test_scholarship):
    # Өмнөх тестээс хадгалагдсан checklist-ийг уншина
    res = client.get(f"/api/scholarship/{test_scholarship}/checklist", headers=auth_headers)
    assert res.status_code == 200
    items = res.json()["items"]
    assert items is not None
    assert len(items) == 2
    assert items[0]["label"] == "CV бэлдэх"
    assert items[1]["done"] is True


# ── Admin-only endpoints (regular user → 403) ─────────────────────────────────

def test_create_scholarship_requires_admin(client, auth_headers):
    res = client.post(
        "/api/scholarship",
        json={"name": "Зөвшөөрөлгүй тэтгэлэг"},
        headers=auth_headers,
    )
    assert res.status_code == 403


def test_update_scholarship_requires_admin(client, auth_headers, test_scholarship):
    res = client.put(
        f"/api/scholarship/{test_scholarship}",
        json={"name": "Өөрчилсөн нэр"},
        headers=auth_headers,
    )
    assert res.status_code == 403


def test_delete_scholarship_requires_admin(client, auth_headers, test_scholarship):
    res = client.delete(
        f"/api/scholarship/{test_scholarship}",
        headers=auth_headers,
    )
    assert res.status_code == 403
