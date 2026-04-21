# CareerPrep — Монгол Карьерын Платформ

Монгол хэл дээрх карьерын хөгжлийн платформ. CV үүсгэх, ярилцлагад бэлтгэх, тэтгэлэг хайх, карьерын зөвлөгөө авах боломжийг нэг дороос олгодог.

---

## Агуулга

- [Функцууд](#функцууд)
- [Технологийн стек](#технологийн-стек)
- [Төслийн бүтэц](#төслийн-бүтэц)
- [Хурдан эхлэх — Docker](#хурдан-эхлэх--docker)
- [Хөгжүүлэгчийн орчин тохируулах](#хөгжүүлэгчийн-орчин-тохируулах)
- [Орчны хувьсагчид](#орчны-хувьсагчид)
- [API маршрутууд](#api-маршрутууд)
- [Өгөгдлийн сангийн загварууд](#өгөгдлийн-сангийн-загварууд)
- [Аюулгүй байдал](#аюулгүй-байдал)
- [Продакшн орчинд байрлуулах](#продакшн-орчинд-байрлуулах)

---

## Функцууд

| Модуль | Тайлбар |
|---|---|
| **CV Үүсгэгч** | Modern / Classic / Minimal загварт CV үүсгэх, засах, PDF экспортлох |
| **Ярилцлагын Бэлтгэл** | Нийтлэг / Техникийн / Зан байдлын асуултуудаар flashcard болон quiz горимд дасгал хийх |
| **Тэтгэлэг** | Тэтгэлгүүдийг хайх, харах, checklist хөтлөх |
| **Карьерын Зөвлөгөө** | CV, ярилцлага, ажил хайлт, карьерын чиглэлээр нийтлэл унших |
| **Хэрэглэгчийн Эрх** | Имэйл баталгаажуулалт, нууц үг сэргээх, хоёр төрлийн эрхийн түвшин (`user` / `admin`) |
| **Админ самбар** | Хэрэглэгч, ярилцлагын асуулт, тэтгэлэг, зөвлөгөө удирдах |

---

## Технологийн стек

### Backend
- **FastAPI** 0.135 — Python вэб фреймворк
- **SQLAlchemy** 2.0 — ORM
- **PostgreSQL** 16 — өгөгдлийн сан
- **Pydantic** v2 — өгөгдлийн баталгаажуулалт
- **python-jose** — JWT токен
- **bcrypt / passlib** — нууц үгийн хаш
- **slowapi** — хурдны хязгаарлалт (rate limiting)
- **uvicorn** — ASGI сервер

### Frontend
- **React** 19 — UI фреймворк
- **Vite** 8 — хөгжүүлэлтийн сервер болон build хэрэгсэл
- **Tailwind CSS** 4 — стиль
- **React Router** 7 — навигаци
- **Axios** — HTTP клиент
- **Framer Motion** — анимаци
- **html2canvas + jsPDF** — PDF экспорт

### Дэд бүтэц
- **Docker + Docker Compose** — контейнержуулалт
- **Gmail SMTP** — имэйл илгээх

---

## Төслийн бүтэц

```
career-platform/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI апп, middleware, router бүртгэл
│   │   ├── database.py        # SQLAlchemy engine, session
│   │   ├── seed.py            # Анхдагч өгөгдөл оруулах
│   │   ├── models/            # ORM загварууд
│   │   │   ├── user.py
│   │   │   ├── cv.py
│   │   │   ├── interview.py
│   │   │   ├── scholarship.py
│   │   │   ├── advice.py
│   │   │   ├── progress.py    # Quiz үр дүн, flashcard явц
│   │   │   ├── email_token.py
│   │   │   ├── audit_log.py
│   │   │   └── scholarship_checklist.py
│   │   ├── schemas/           # Pydantic request/response схемүүд
│   │   ├── routers/           # Route handler-ууд
│   │   │   ├── auth.py
│   │   │   ├── cv.py
│   │   │   ├── interview.py
│   │   │   ├── scholarship.py
│   │   │   ├── advice.py
│   │   │   └── admin.py
│   │   └── services/
│   │       ├── auth.py        # JWT, bcrypt, get_current_user
│   │       ├── email_service.py  # Gmail SMTP
│   │       ├── csrf.py        # CSRF токен баталгаажуулалт
│   │       └── rate_limit.py  # slowapi тохиргоо
│   ├── tests/                 # pytest тестүүд
│   ├── scripts/
│   │   └── backup.sh          # PostgreSQL нөөцлөлт
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.jsx            # Router, PrivateRoute, AdminRoute
│       ├── context/
│       │   └── AuthContext.jsx  # Глобал auth төлөв
│       ├── services/
│       │   └── api.js         # Axios instance, токен interceptor
│       ├── pages/             # ~27 хуудас (нэг файл = нэг маршрут)
│       └── components/        # Дахин ашиглагдах UI хэсгүүд
├── docker-compose.yml
└── README.md
```

---

## Хурдан эхлэх — Docker

Хамгийн хурдан арга. Docker суусан байх шаардлагатай.

```bash
# 1. Репозиторийг татах
git clone <репозиторийн URL>
cd career-platform

# 2. Орчны тохиргоо файл үүсгэх
cp backend/.env.example backend/.env
```

`backend/.env` файлыг нээж дараах утгуудыг тохируулна:

```env
SECRET_KEY=<доорх командаар үүсгэсэн нууц түлхүүр>
ALLOWED_ORIGINS=http://localhost:5173
API_BASE_URL=http://localhost:8001
```

Нууц түлхүүр үүсгэх:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

```bash
# 3. Backend + PostgreSQL асаах
docker compose up -d --build

# 4. Frontend ажиллуулах
cd frontend
npm install
npm run dev
```

Амжилттай эхэлсний дараа:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8001/api
- API баримт бичиг (Swagger): http://localhost:8001/docs

---

## Хөгжүүлэгчийн орчин тохируулах

Docker ашиглахгүйгээр дараах байдлаар тус тусад нь ажиллуулж болно.

### Шаардлага

- Python 3.11+
- Node.js 20+
- PostgreSQL 14+

### Backend

```bash
cd backend

# Виртуал орчин үүсгэх
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Хамаарлуудыг суулгах
pip install -r requirements.txt

# Орчны тохиргоо хийх
cp .env.example .env
# .env файлыг засах

# Серверийг ажиллуулах
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Сервер анх ажиллах үед автоматаар:
1. Өгөгдлийн сангийн хүснэгтүүдийг үүсгэнэ
2. Миграцуудыг ажиллуулна
3. Анхдагч өгөгдөл (ярилцлагын асуулт, тэтгэлэг, зөвлөгөө) оруулна

### Frontend

```bash
cd frontend

# Хамаарлуудыг суулгах
npm install

# Хөгжүүлэлтийн сервер ажиллуулах
npm run dev
```

Бусад ашигтай командууд:
```bash
npm run build    # Продакшн build үүсгэх
npm run lint     # ESLint шалгах
npm run preview  # Build-г орон нутагт урьдчилан харах
```

---

## Орчны хувьсагчид

`backend/.env` файлд тохируулна:

| Хувьсагч | Заавал эсэх | Тайлбар |
|---|---|---|
| `SECRET_KEY` | **Тийм** | JWT гарын үсгийн нууц түлхүүр. Продакшнд заавал шинэ үүсгэх. |
| `DATABASE_URL` | **Тийм** | PostgreSQL холболтын мөр. Docker Compose автоматаар тохируулна. |
| `ALLOWED_ORIGINS` | **Тийм** | Зөвшөөрөгдсөн frontend URL-ууд, таслалаар тусгаарласан. |
| `API_BASE_URL` | **Тийм** | Backend-ийн нийтийн URL (файлын абсолют холбоос үүсгэхэд хэрэглэнэ). |
| `SMTP_HOST` | Үгүй | Имэйл сервер (өгөгдмөл: `smtp.gmail.com`). |
| `SMTP_PORT` | Үгүй | Имэйл порт (өгөгдмөл: `587`). |
| `SMTP_USER` | Үгүй | Gmail хаяг. Хоосон үлдээвэл имэйл console-д хэвлэнэ. |
| `SMTP_PASSWORD` | Үгүй | Gmail App Password (**бүртгэлийн нууц үг биш**). |
| `SMTP_FROM_NAME` | Үгүй | Илгээгчийн нэр (өгөгдмөл: `CareerPrep`). |
| `FRONTEND_URL` | Үгүй | Имэйл дэх холбоосонд хэрэглэнэ (өгөгдмөл: `http://localhost:5173`). |

### Gmail App Password тохируулах

1. Google акаунтын тохиргоо → Аюулгүй байдал → 2 алхамт баталгаажуулалт идэвхжүүлэх
2. "App passwords" хайж, "CareerPrep" нэртэй шинэ нууц үг үүсгэх
3. Үүссэн 16 тэмдэгтийн нууц үгийг `SMTP_PASSWORD`-д оруулах

---

## API маршрутууд

Бүх маршрут `/api` угтвартай. Баталгаажуулалт шаардах маршрутуудад `Authorization: Bearer <токен>` толгой хэрэглэнэ.

### Баталгаажуулалт (`/api/auth`)

| Метод | Зам | Тайлбар |
|---|---|---|
| POST | `/register` | Шинэ хэрэглэгч бүртгэх |
| POST | `/login` | Нэвтрэх, JWT токен авах |
| GET | `/me` | Нэвтэрсэн хэрэглэгчийн мэдээлэл |
| POST | `/verify-email` | Имэйл баталгаажуулах |
| POST | `/resend-verification` | Баталгаажуулах имэйл дахин илгээх |
| POST | `/forgot-password` | Нууц үг сэргээх хүсэлт |
| POST | `/reset-password` | Нууц үг шинэчлэх |
| POST | `/refresh` | Токен сэлбэх |
| GET | `/csrf-token` | CSRF токен авах |

### CV (`/api/cv`) — Нэвтрэлт шаардана

| Метод | Зам | Тайлбар |
|---|---|---|
| GET | `/` | Өөрийн CV жагсаалт |
| POST | `/` | Шинэ CV үүсгэх |
| GET | `/{id}` | CV дэлгэрэнгүй |
| PUT | `/{id}` | CV засах |
| DELETE | `/{id}` | CV устгах |

### Ярилцлага (`/api/interview`)

| Метод | Зам | Тайлбар |
|---|---|---|
| GET | `/questions` | Асуултуудын жагсаалт (шүүлтүүртэй) |
| GET | `/questions/{id}` | Асуулт дэлгэрэнгүй |
| POST | `/quiz/submit` | Quiz хариулт илгээх, үр дүн авах |
| GET | `/quiz/history` | Quiz-ийн түүх |
| POST | `/flashcard/{id}/viewed` | Flashcard үзэсэн тэмдэглэх |
| GET | `/flashcard/progress` | Flashcard явц |

### Тэтгэлэг (`/api/scholarship`)

| Метод | Зам | Тайлбар |
|---|---|---|
| GET | `/` | Тэтгэлгүүдийн жагсаалт |
| GET | `/{id}` | Тэтгэлэг дэлгэрэнгүй |
| GET | `/{id}/checklist` | Checklist авах |
| PUT | `/{id}/checklist` | Checklist шинэчлэх |

### Зөвлөгөө (`/api/advice`)

| Метод | Зам | Тайлбар |
|---|---|---|
| GET | `/` | Зөвлөгөөний жагсаалт (ангиллаар шүүх боломжтой) |
| GET | `/{id}` | Зөвлөгөө дэлгэрэнгүй |

### Админ (`/api/admin`) — Админ эрх шаардана

| Метод | Зам | Тайлбар |
|---|---|---|
| GET | `/users` | Бүх хэрэглэгчдийн жагсаалт |
| PUT | `/users/{id}` | Хэрэглэгч засах / эрх өөрчлөх |
| DELETE | `/users/{id}` | Хэрэглэгч устгах |
| POST | `/interview/questions` | Ярилцлагын асуулт нэмэх |
| PUT | `/interview/questions/{id}` | Асуулт засах |
| DELETE | `/interview/questions/{id}` | Асуулт устгах |
| POST | `/scholarship` | Тэтгэлэг нэмэх |
| PUT | `/scholarship/{id}` | Тэтгэлэг засах |
| DELETE | `/scholarship/{id}` | Тэтгэлэг устгах |
| POST | `/advice` | Зөвлөгөө нэмэх |
| PUT | `/advice/{id}` | Зөвлөгөө засах |
| DELETE | `/advice/{id}` | Зөвлөгөө устгах |
| GET | `/audit-logs` | Аудитын бүртгэл |

---

## Өгөгдлийн сангийн загварууд

```
users
├── id, email, hashed_password
├── full_name, role (user/admin)
├── is_active, is_verified, verified_at
└── created_at

cvs
├── id, user_id → users
├── title, template (modern/classic/minimal)
├── personal_info (JSON)
└── created_at, updated_at

  educations          work_experiences        skills
  ├── cv_id → cvs     ├── cv_id → cvs         ├── cv_id → cvs
  └── ...             └── ...                 └── ...

interview_questions
├── id, question, answer, category (general/technical/behavioral)
├── difficulty (easy/medium/hard), tags
├── is_quiz (bool)
│   ├── option_a/b/c/d, correct_option, explanation  ← quiz горимд
└── created_at

scholarships
└── id, name, organization, description, deadline, ...

advices
└── id, title, content, category (cv/interview/job_search/career), ...

email_tokens
├── id, user_id → users
├── token, token_type (verify_email/reset_password)
└── expires_at (1 цагийн дараа)

user_quiz_results       user_flashcard_progress    audit_logs
├── user_id             ├── user_id                ├── user_id
├── total, correct      ├── question_id            ├── action, ip_address
└── percentage          └── viewed_at              └── details

user_scholarship_checklists
├── user_id + scholarship_id (UNIQUE)
└── items (JSON), updated_at
```

---

## Аюулгүй байдал

Системд дараах аюулгүй байдлын механизмууд бий:

### JWT баталгаажуулалт
- HS256 алгоритм, 30 минутын хугацаатай access токен
- Бүх хамгаалагдсан маршрут `Authorization: Bearer <токен>` шаардана

### CSRF хамгаалалт
- `GET`, `HEAD`, `OPTIONS` бус бүх хүсэлтэд (нэвтрэх, бүртгэл зэрэг нийтийн маршрутаас бусад) `X-CSRF-Token` толгой шаардана
- `/api/auth/csrf-token` маршрутаар токен авна

### Хурдны хязгаарлалт (Rate Limiting)
- Ерөнхий: 200 хүсэлт/минут (IP хаягаар тоолно)
- Нэвтрэх, бүртгэл зэрэг auth маршрутуудад илүү хатуу хязгаар

### Нууц үгийн хаш
- bcrypt алгоритмаар хаш хийнэ, plain text хэзээ ч хадгалагдахгүй

### Имэйл баталгаажуулалт
- Шинэ хэрэглэгч имэйлээ баталгаажуулахгүйгээр нэвтрэх боломжгүй
- Токен 1 цагт дуусгавар болно

### Аудитын бүртгэл
- Нэвтрэх, бүртгэл, засах зэрэг гол үйлдлүүд `audit_logs` хүснэгтэд бүртгэгдэнэ

---

## Продакшн орчинд байрлуулах

### Backend (Docker)

```bash
# 1. Орчны тохиргоо
cp backend/.env.example backend/.env
# Дараах утгуудыг заавал тохируулна:
# SECRET_KEY — шинэ нууц түлхүүр үүсгэх
# ALLOWED_ORIGINS — жинхэнэ frontend домайн
# API_BASE_URL — жинхэнэ backend домайн
# SMTP_USER, SMTP_PASSWORD — имэйл тохиргоо

# 2. Ажиллуулах
docker compose up -d --build
```

### Frontend (статик хост)

```bash
cd frontend
npm install
npm run build
# dist/ хавтасыг Vercel, Netlify, эсвэл nginx-д байрлуулна
```

### Nginx жишээ тохиргоо

```nginx
server {
    listen 443 ssl;
    server_name api.careerprep.mn;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Продакшн шалгах жагсаалт

- [ ] `SECRET_KEY` шинэ, хүчтэй утгаар солигдсон
- [ ] `ALLOWED_ORIGINS` жинхэнэ домайнаар тохируулсан
- [ ] `API_BASE_URL` жинхэнэ backend URL-аар тохируулсан
- [ ] SMTP имэйл тохиргоо хийгдсэн
- [ ] Reverse proxy (nginx/Caddy) TLS-тай тохируулсан
- [ ] `backend/uploads/` Docker volume-оор хадгалагдаж байгаа
- [ ] Мэдээллийн сангийн нөөцлөлт (`scripts/backup.sh`) тохируулсан

### Нөөцлөлт

```bash
# Гараар нөөцлөх
bash backend/scripts/backup.sh

# Cron-оор автоматжуулах (backup_cron.txt файлаас харна уу)
```

---

## Тестүүд

```bash
cd backend
pytest tests/
```

Тест файлууд:
- `tests/test_auth.py` — бүртгэл, нэвтрэх, токен
- `tests/test_cv.py` — CV үүсгэх, засах, устгах
- `tests/test_interview.py` — асуулт, quiz, flashcard

---

## Хөгжүүлэгчдэд зориулсан нэмэлт мэдээлэл

### Шинэ маршрут нэмэх

1. `backend/app/models/` дотор ORM загвар үүсгэх
2. `backend/app/schemas/` дотор Pydantic схем үүсгэх
3. `backend/app/routers/` дотор router файл үүсгэх
4. `main.py`-д `app.include_router(...)` нэмэх

### Миграци нэмэх

`main.py`-ийн `run_migrations()` функцэд idempotent SQL мэдэгдэл нэмнэ:

```python
conn.execute(text("ALTER TABLE my_table ADD COLUMN IF NOT EXISTS new_col VARCHAR(100)"))
```

### Frontend-д шинэ хуудас нэмэх

1. `frontend/src/pages/` дотор шинэ `.jsx` файл үүсгэх
2. `App.jsx`-д маршрут бүртгэх
3. Хамгаалагдсан хуудсанд `<PrivateRoute>`, админ хуудсанд `<AdminRoute>` ашиглах

---

## Холбоо барих

Асуулт, санал хүсэлт байвал GitHub Issues ашиглана уу.
