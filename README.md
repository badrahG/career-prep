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
- [Тестүүд](#тестүүд)
- [Продакшн орчинд байрлуулах](#продакшн-орчинд-байрлуулах)

---

## Функцууд

| Модуль | Тайлбар |
|---|---|
| **CV Үүсгэгч** | Modern / Classic / Minimal загварт CV үүсгэх, засах, PDF экспортлох |
| **Ярилцлагын Бэлтгэл** | Нийтлэг / Техникийн / Зан байдлын асуултуудаар flashcard болон quiz горимд дасгал хийх |
| **Тэтгэлэг** | Тэтгэлгүүдийг хайх, bookmark хийх, checklist хөтлөх |
| **Карьерын Зөвлөгөө** | CV, ярилцлага, ажил хайлт, карьерын чиглэлээр нийтлэл унших |
| **Захиалгын систем** | Free / Pro төлөвлөгөө, QPay төлбөр, AI болон орчуулгын лимит |
| **Хэрэглэгчийн Эрх** | Имэйл баталгаажуулалт, нууц үг сэргээх, `user` / `admin` эрхийн түвшин |
| **Сессийн хугацаа** | 15 минут идэвхгүй байхад автоматаар гарах |
| **Мэдэгдэл** | Шинэ тэтгэлэг, зөвлөгөө нэмэгдэхэд мэдэгдэл |
| **Админ самбар** | Хэрэглэгч, ярилцлагын асуулт, тэтгэлэг, зөвлөгөө удирдах |

---

## Технологийн стек

### Backend
- **FastAPI** — Python вэб фреймворк
- **SQLAlchemy** 2.0 — ORM
- **PostgreSQL** 16 — өгөгдлийн сан
- **Pydantic** v2 — өгөгдлийн баталгаажуулалт
- **python-jose** — JWT токен (access 15 мин, refresh 7 хоног)
- **bcrypt** — нууц үгийн хаш
- **slowapi** — хурдны хязгаарлалт (rate limiting)
- **uvicorn** — ASGI сервер

### Frontend
- **React** 19 — UI фреймворк
- **Vite** 8 — хөгжүүлэлтийн сервер болон build хэрэгсэл
- **Tailwind CSS** 4 — стиль
- **React Router** 7 — навигаци
- **Axios** — HTTP клиент, токен interceptor, auto-refresh
- **Framer Motion** — анимаци
- **html2canvas + jsPDF** — PDF экспорт
- **Recharts** — графикийн бүрэлдэхүүн

### Тест
- **pytest** — backend тест (57 тест)
- **Vitest + @testing-library/react** — frontend тест (9 тест)

### Дэд бүтэц
- **Docker + Docker Compose** — контейнержуулалт
- **Brevo HTTP API** — имэйл илгээх (продакшн)
- **Gmail SMTP** — имэйл илгээх (локал)

---

## Төслийн бүтэц

```
career-platform/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI апп, middleware, router бүртгэл
│   │   ├── database.py           # SQLAlchemy engine, session
│   │   ├── seed.py               # Анхдагч өгөгдөл оруулах
│   │   ├── models/               # ORM загварууд
│   │   │   ├── user.py
│   │   │   ├── cv.py
│   │   │   ├── interview.py
│   │   │   ├── scholarship.py
│   │   │   ├── advice.py
│   │   │   ├── progress.py       # Quiz үр дүн, flashcard явц
│   │   │   ├── email_token.py
│   │   │   ├── audit_log.py
│   │   │   ├── refresh_token.py
│   │   │   ├── subscription.py   # Захиалгын төлөвлөгөө, хэрэглээ
│   │   │   ├── notification.py
│   │   │   ├── scholarship_bookmark.py
│   │   │   └── scholarship_checklist.py
│   │   ├── schemas/              # Pydantic request/response схемүүд
│   │   ├── routers/              # Route handler-ууд
│   │   │   ├── auth.py
│   │   │   ├── cv.py
│   │   │   ├── interview.py
│   │   │   ├── scholarship.py
│   │   │   ├── advice.py
│   │   │   ├── admin.py
│   │   │   ├── subscription.py
│   │   │   ├── notification.py
│   │   │   ├── certificates.py
│   │   │   └── settings.py
│   │   └── services/
│   │       ├── auth.py           # JWT, bcrypt, get_current_user
│   │       ├── email_service.py  # Brevo API / Gmail SMTP
│   │       ├── csrf.py           # CSRF токен баталгаажуулалт
│   │       ├── rate_limit.py     # slowapi тохиргоо
│   │       ├── usage.py          # AI / орчуулгын лимит шалгах
│   │       └── cache.py          # Дотоод кэш
│   ├── tests/
│   │   ├── conftest.py           # Fixture-үүд, SQLite тест DB
│   │   ├── test_auth.py
│   │   ├── test_cv.py
│   │   ├── test_email.py
│   │   ├── test_interview.py
│   │   ├── test_scholarship.py
│   │   └── test_advice.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.jsx               # Router, PrivateRoute, AdminRoute
│       ├── context/
│       │   └── AuthContext.jsx   # Глобал auth төлөв, inactivity timer
│       ├── services/
│       │   └── api.js            # Axios instance, токен interceptor, CSRF
│       ├── pages/                # ~27 хуудас (нэг файл = нэг маршрут)
│       ├── components/           # Дахин ашиглагдах UI хэсгүүд
│       └── test/
│           ├── setup.js
│           ├── Login.test.jsx
│           ├── AuthContext.test.jsx
│           └── api.test.js
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
npm run build      # Продакшн build үүсгэх
npm run lint       # ESLint шалгах
npm run preview    # Build-г орон нутагт урьдчилан харах
npm run test:run   # Frontend тестүүд нэг удаа ажиллуулах
npm run test       # Frontend тестүүд watch горимд ажиллуулах
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
| `BREVO_API_KEY` | Үгүй | Brevo имэйл API түлхүүр (продакшн). Хоосон бол SMTP ашиглана. |
| `BREVO_FROM_EMAIL` | Үгүй | Brevo-д баталгаажуулсан илгээгчийн имэйл. |
| `SMTP_HOST` | Үгүй | Имэйл сервер (өгөгдмөл: `smtp.gmail.com`). |
| `SMTP_PORT` | Үгүй | Имэйл порт (өгөгдмөл: `587`). |
| `SMTP_USER` | Үгүй | Gmail хаяг. Хоосон үлдээвэл имэйл console-д хэвлэнэ. |
| `SMTP_PASSWORD` | Үгүй | Gmail App Password (**бүртгэлийн нууц үг биш**). |
| `SMTP_FROM_NAME` | Үгүй | Илгээгчийн нэр (өгөгдмөл: `CareerPrep`). |
| `FRONTEND_URL` | Үгүй | Имэйл дэх холбоосонд хэрэглэнэ (өгөгдмөл: `http://localhost:5173`). |

### Имэйл тохиргоо

**Продакшн — Brevo (санал болгодог):**
1. [brevo.com](https://brevo.com) дээр бүртгүүлж API түлхүүр авах
2. Илгээгчийн имэйлийг баталгаажуулах
3. `BREVO_API_KEY` болон `BREVO_FROM_EMAIL` тохируулах

**Локал — Gmail SMTP:**
1. Google акаунтын тохиргоо → Аюулгүй байдал → 2 алхамт баталгаажуулалт идэвхжүүлэх
2. "App passwords" хайж, "CareerPrep" нэртэй шинэ нууц үг үүсгэх
3. Үүссэн 16 тэмдэгтийн нууц үгийг `SMTP_PASSWORD`-д оруулах

---

## API маршрутууд

Бүх маршрут `/api` угтвартай. Баталгаажуулалт шаардах маршрутуудад `Authorization: Bearer <токен>` болон `X-CSRF-Token` толгой хэрэглэнэ.

### Баталгаажуулалт (`/api/auth`)

| Метод | Зам | Тайлбар |
|---|---|---|
| POST | `/register` | Шинэ хэрэглэгч бүртгэх |
| POST | `/login` | Нэвтрэх, access + refresh токен авах |
| GET | `/me` | Нэвтэрсэн хэрэглэгчийн мэдээлэл |
| POST | `/refresh` | Access токен сэлбэх |
| GET | `/csrf-token` | CSRF токен авах |
| POST | `/verify-email` | Имэйл баталгаажуулах |
| POST | `/resend-verification` | Баталгаажуулах имэйл дахин илгээх |
| POST | `/forgot-password` | Нууц үг сэргээх хүсэлт |
| POST | `/reset-password` | Нууц үг шинэчлэх |
| POST | `/change-password` | Нууц үг солих (нэвтрэлт шаардана) |
| GET | `/dashboard-stats` | Dashboard статистик |

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
| GET | `/quiz/questions` | Quiz асуултуудын жагсаалт |
| POST | `/quiz/submit` | Quiz хариулт илгээх, үр дүн авах |
| GET | `/stats` | Ярилцлагын статистик |
| POST | `/flashcard/{id}/viewed` | Flashcard үзэсэн тэмдэглэх |

### Тэтгэлэг (`/api/scholarship`)

| Метод | Зам | Тайлбар |
|---|---|---|
| GET | `/` | Тэтгэлгүүдийн жагсаалт |
| GET | `/{id}` | Тэтгэлэг дэлгэрэнгүй |
| GET | `/bookmarks` | Bookmark хийсэн тэтгэлгүүд (нэвтрэлт шаардана) |
| POST | `/{id}/bookmark` | Bookmark нэмэх / хасах (нэвтрэлт шаардана) |
| GET | `/{id}/checklist` | Checklist авах (нэвтрэлт шаардана) |
| PUT | `/{id}/checklist` | Checklist шинэчлэх (нэвтрэлт шаардана) |

### Зөвлөгөө (`/api/advice`)

| Метод | Зам | Тайлбар |
|---|---|---|
| GET | `/` | Зөвлөгөөний жагсаалт (ангиллаар шүүх боломжтой) |
| GET | `/stats` | Ангилал тус бүрийн тоо |
| GET | `/{id}` | Зөвлөгөө дэлгэрэнгүй |
| POST | `/{id}/view` | Үзэлтийн тоо нэмэх (нэвтрэлт шаардана) |

### Админ (`/api/admin`) — Админ эрх шаардана

| Метод | Зам | Тайлбар |
|---|---|---|
| GET | `/users` | Бүх хэрэглэгчдийн жагсаалт |
| PUT | `/users/{id}` | Хэрэглэгч засах / эрх өөрчлөх |
| DELETE | `/users/{id}` | Хэрэглэгч устгах |
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
├── id, email, password (bcrypt)
├── first_name, last_name, role (user/admin)
├── is_active, is_verified, verified_at
├── failed_login_attempts, locked_until
└── created_at

cvs
├── id, user_id → users
├── name, template_type (modern/classic/minimal)
├── cv_type (job/scholarship), personal_info (JSON)
└── created_at, updated_at

  educations          work_experiences        skills
  ├── cv_id → cvs     ├── cv_id → cvs         ├── cv_id → cvs
  └── ...             └── ...                 └── ...

interview_questions
├── id, question_mn, sample_answer, category
├── difficulty (easy/medium/hard), tags
├── is_quiz → option_a/b/c/d, correct_option, explanation
└── created_at

scholarships
└── id, name, organization, target, deadline, ...

scholarship_bookmarks
└── user_id + scholarship_id (UNIQUE)

user_scholarship_checklists
├── user_id + scholarship_id (UNIQUE)
└── items (JSON)

advices
└── id, title, content, category (cv/interview/job_search/career),
    is_published, view_count, ...

refresh_tokens
├── user_id → users
├── token_hash (SHA-256), expires_at
└── revoked_at

subscription_plans       user_subscriptions      usage_tracking
├── name (free/pro)      ├── user_id → users     ├── user_id → users
├── ai_limit, tr_limit   ├── plan_id             ├── ai_used, tr_used
└── cover_letter         └── period_start/end    └── period_start/end

email_tokens
├── user_id → users
├── token, token_type (verify_email/reset_password)
└── expires_at (1 цаг)

audit_logs
├── user_id → users
├── action, ip_address
└── details, created_at

notifications             notification_reads
├── type, title, body     ├── user_id → users
└── created_at            └── notification_id → notifications
```

---

## Аюулгүй байдал

### JWT баталгаажуулалт
- HS256 алгоритм
- **Access токен: 15 минут**, Refresh токен: 7 хоног
- Refresh токен SHA-256 хаштай өгөгдлийн санд хадгалагдана

### Сессийн хугацаа (Session Timeout)
- **15 минут идэвхгүй** байхад автоматаар гарах
- Идэвхийг `mousemove`, `keydown`, `click`, `scroll`, `touchstart` үйлдлээр тоолно
- Гарахад `/login?reason=timeout` руу redirect хийж мэдэгдэл харуулна

### CSRF хамгаалалт
- `GET`, `HEAD`, `OPTIONS` бус бүх хүсэлтэд `X-CSRF-Token` толгой шаардана
- Нийтийн маршрутууд (login, register гэх мэт) exempt
- `/api/auth/csrf-token` маршрутаар токен авна

### Хурдны хязгаарлалт (Rate Limiting)
- Ерөнхий: 200 хүсэлт/минут (IP хаягаар тоолно)
- Auth маршрутуудад: 3–10 хүсэлт/минут
- 5 удаа буруу нууц үг оруулбал 15 минут түгжигдэнэ

### Нууц үгийн хаш
- bcrypt алгоритмаар хаш хийнэ, plain text хэзээ ч хадгалагдахгүй

### Имэйл баталгаажуулалт
- Шинэ хэрэглэгч имэйлээ баталгаажуулахгүйгээр нэвтрэх боломжгүй
- Токен 1 цагт дуусгавар болно

### Аудитын бүртгэл
- Нэвтрэх, бүртгэл, нууц үг солих зэрэг гол үйлдлүүд `audit_logs` хүснэгтэд бүртгэгдэнэ

---

## Тестүүд

### Backend (pytest)

```bash
cd backend
pytest tests/ -v
```

| Файл | Тест тоо | Юу шалгадаг |
|---|---|---|
| `test_auth.py` | 10 | Бүртгэл, нэвтрэх, токен, нууц үг |
| `test_cv.py` | 6 | CV үүсгэх, засах, устгах |
| `test_email.py` | 6 | Имэйл илгээх функцүүд |
| `test_interview.py` | 6 | Асуулт, quiz |
| `test_scholarship.py` | 15 | Жагсаалт, bookmark, checklist, эрх шалгах |
| `test_advice.py` | 13 | Жагсаалт, stats, view count, эрх шалгах |
| **Нийт** | **57** | |

Тест орчин: SQLite (тусдаа `test.db`), production DB-д нөлөөгүй.

### Frontend (Vitest)

```bash
cd frontend
npm run test:run    # Нэг удаа ажиллуулах
npm run test        # Watch горим
```

| Файл | Тест тоо | Юу шалгадаг |
|---|---|---|
| `Login.test.jsx` | 4 | `?reason=timeout` banner харагдах/харагдахгүй |
| `AuthContext.test.jsx` | 3 | 15 мин timer, logout, reset |
| `api.test.js` | 2 | 401 → redirect логик |
| **Нийт** | **9** | |

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
# BREVO_API_KEY, BREVO_FROM_EMAIL — имэйл тохиргоо

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
- [ ] Brevo эсвэл SMTP имэйл тохиргоо хийгдсэн
- [ ] Reverse proxy (nginx/Caddy) TLS-тай тохируулсан
- [ ] `backend/uploads/` Docker volume-оор хадгалагдаж байгаа
- [ ] Мэдээллийн сангийн нөөцлөлт тохируулсан

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
