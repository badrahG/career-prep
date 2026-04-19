CV_PAYLOAD = {
    "name": "Миний CV",
    "template_type": "modern",
    "personal_info": '{"name": "Тест"}',
    "educations": [{"school": "МУИС", "major": "CS", "start_year": 2020, "end_year": 2024, "gpa": 3.5}],
    "experiences": [],
    "skills": [{"skill_name": "Python", "skill_type": "technical", "level": "дунд"}],
}


def test_create_cv(client, auth_headers):
    res = client.post("/api/cv", json=CV_PAYLOAD, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Миний CV"
    assert len(data["educations"]) == 1
    return data["id"]


def test_get_cv_list(client, auth_headers):
    client.post("/api/cv", json=CV_PAYLOAD, headers=auth_headers)
    res = client.get("/api/cv", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_cv_by_id(client, auth_headers):
    create_res = client.post("/api/cv", json=CV_PAYLOAD, headers=auth_headers)
    cv_id = create_res.json()["id"]
    res = client.get(f"/api/cv/{cv_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["id"] == cv_id


def test_update_cv(client, auth_headers):
    create_res = client.post("/api/cv", json=CV_PAYLOAD, headers=auth_headers)
    cv_id = create_res.json()["id"]
    updated = {**CV_PAYLOAD, "name": "Шинэчлэгдсэн CV"}
    res = client.put(f"/api/cv/{cv_id}", json=updated, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["name"] == "Шинэчлэгдсэн CV"


def test_delete_cv(client, auth_headers):
    create_res = client.post("/api/cv", json=CV_PAYLOAD, headers=auth_headers)
    cv_id = create_res.json()["id"]
    res = client.delete(f"/api/cv/{cv_id}", headers=auth_headers)
    assert res.status_code == 200
    not_found = client.get(f"/api/cv/{cv_id}", headers=auth_headers)
    assert not_found.status_code == 404


def test_cv_requires_auth(client):
    res = client.get("/api/cv")
    assert res.status_code == 401
