def test_get_questions(client):
    res = client.get("/api/interview/questions")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_questions_filter_category(client):
    res = client.get("/api/interview/questions?category=general")
    assert res.status_code == 200


def test_get_quiz_questions(client):
    res = client.get("/api/interview/quiz/questions")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_stats(client):
    res = client.get("/api/interview/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "general" in data


def test_submit_empty_quiz(client):
    res = client.post("/api/interview/quiz/submit", json={"answers": []})
    assert res.status_code == 400


def test_submit_quiz(client):
    questions = client.get("/api/interview/quiz/questions?limit=3").json()
    if not questions:
        return
    answers = [{"question_id": q["id"], "selected_option": "a"} for q in questions]
    res = client.post("/api/interview/quiz/submit", json={"answers": answers})
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "correct" in data
    assert "percentage" in data
