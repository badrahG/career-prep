from app.database import SessionLocal
from app.models.interview import InterviewQuestion
from app.models.scholarship import Scholarship
from app.models.advice import Advice
from datetime import date
import json


def seed_data():
    db = SessionLocal()

    # Seed interview questions (unchanged from before)
    if db.query(InterviewQuestion).count() == 0:
        _seed_interview(db)

    # Seed scholarships (unchanged from before)
    if db.query(Scholarship).count() == 0:
        _seed_scholarships(db)

    # Seed advice (new)
    if db.query(Advice).count() == 0:
        _seed_advice(db)

    db.close()


def _seed_interview(db):
    questions = [
        InterviewQuestion(question_mn="Өөрийнхөө тухай товч ярина уу", category="general",
            sample_answer="Боловсрол, туршлага, зорилгоо 1-2 минутад товч тайлбарлана. 'Elevator pitch' хэлбэрээр: хэн байна, юу хийдэг, юу сонирхдог, юуг хайж байна.",
            advice="Урьдчилж толинд 30 секунд, 1 минут, 2 минутын хувилбар бэлдэж дадлагажих.",
            difficulty="easy", tags="self-intro"),
        InterviewQuestion(question_mn="Яагаад манай компанид ажиллахыг хүсэж байна вэ?", category="general",
            sample_answer="Компанийн зорилго, соёлтой таны ур чадвар хэрхэн нийцэж байгааг тайлбарлана.",
            advice="Ярилцлагын өмнө компанийн сайт судлах.", difficulty="easy"),
        InterviewQuestion(question_mn="Таны хамгийн том давуу тал юу вэ?", category="general",
            sample_answer="Бодит жишээгээр давуу талаа тайлбарлана.", advice="Тодорхой жишээ бэлдэх.", difficulty="easy"),
        InterviewQuestion(question_mn="Таны сул тал юу вэ?", category="general",
            sample_answer="Бодит сул талаа хэлж, хэрхэн сайжруулж буйгаа нэмнэ.",
            advice="Сул тал байхгүй гэж хэлэхгүй.", difficulty="medium"),
        InterviewQuestion(question_mn="5 жилийн дараа өөрийгөө хаана харж байна вэ?", category="general",
            sample_answer="Тухайн салбарт өсөж хөгжих зорилгоо хэлнэ.", advice="Тодорхой зорилго.", difficulty="medium"),
        InterviewQuestion(question_mn="Яагаад таныг сонгох ёстой вэ?", category="general",
            sample_answer="Таны ур чадвар, туршлага ажилд хэрхэн тохирохыг тайлбарлана.",
            advice="Job description-ийн шаардлагад таарах жишээ бэлтгэх.", difficulty="medium"),
        InterviewQuestion(question_mn="Цалингийн хүлээлт тань хэд вэ?", category="general",
            sample_answer="Зах зээлийн судалгаанд үндэслэн тодорхой хүрээ өгнө.",
            advice="glassdoor.mn, worki.mn дээр судлаарай.", difficulty="hard"),
        InterviewQuestion(question_mn="Яагаад өмнөх ажлаасаа гарсан вэ?", category="general",
            sample_answer="Өсөлтийн шинэ боломж хайж байгаагаа хэлнэ.",
            advice="Өмнөх ажил олгогчийг шүүмжлэхгүй.", difficulty="medium"),
        InterviewQuestion(question_mn="Танд юу асуух уу?", category="general",
            sample_answer="3-5 асуулт бэлдэж ирэх.", advice="'Байхгүй' гэж хэзээ ч хэлэхгүй.", difficulty="easy"),
        InterviewQuestion(question_mn="Бидэнтэй хамт ажиллах юу танд тохиромжтой вэ?", category="general",
            sample_answer="Компанийн онцлогтой уялдуулан тайлбарлана.", advice="Тодорхой дурдах.", difficulty="medium"),

        InterviewQuestion(question_mn="REST API гэж юу вэ? HTTP методуудыг нэрлэнэ үү", category="technical",
            sample_answer="REST нь веб сервисийн архитектурын загвар. GET, POST, PUT, DELETE.",
            advice="Stateless гэдэг ойлголтыг дурдах.", difficulty="medium"),
        InterviewQuestion(question_mn="Git гэж юу вэ? Branch, merge, rebase ялгааг тайлбарла", category="technical",
            sample_answer="Git бол хувилбар удирдлагын систем.",
            advice="Pull request дурдах.", difficulty="medium"),
        InterviewQuestion(question_mn="SQL ба NoSQL ялгаа, хэзээ аль нэгийг сонгох вэ?", category="technical",
            sample_answer="SQL хүснэгт, NoSQL document-based.", advice="Жишээ дурдах.", difficulty="hard"),
        InterviewQuestion(question_mn="OOP-ийн 4 үндсэн зарчмыг тайлбарла", category="technical",
            sample_answer="Encapsulation, Inheritance, Polymorphism, Abstraction.",
            advice="Код дээр жишээ өгөх.", difficulty="medium"),
        InterviewQuestion(question_mn="JavaScript-ийн var, let, const ялгаа юу вэ?", category="technical",
            sample_answer="var function-scoped, let болон const block-scoped.",
            advice="Hoisting жишээгээр.", difficulty="medium"),
        InterviewQuestion(question_mn="React-ийн useState болон useEffect hook-ийн ялгаа юу вэ?", category="technical",
            sample_answer="useState — state, useEffect — side effects.",
            advice="Cleanup function дурдах.", difficulty="medium"),
        InterviewQuestion(question_mn="HTTP болон HTTPS ялгаа, TLS юу хийдэг вэ?", category="technical",
            sample_answer="HTTPS нь TLS/SSL шифрлэлттэй.",
            advice="Certificate authority дурдах.", difficulty="hard"),
        InterviewQuestion(question_mn="State management сан яагаад хэрэгтэй вэ?", category="technical",
            sample_answer="Олон component хооронд state хуваалцах.",
            advice="Context API сонголт.", difficulty="hard"),

        InterviewQuestion(question_mn="Багаар ажиллаж амжилтанд хүрсэн туршлагаа ярина уу", category="behavioral",
            sample_answer="STAR бүтэц: S(Situation), T(Task), A(Action), R(Result).",
            advice="Тоон үр дүн оруулах.", difficulty="medium"),
        InterviewQuestion(question_mn="Хүнд хэцүү шийдвэр гаргасан туршлагаа ярина уу", category="behavioral",
            sample_answer="STAR бүтэцтэй.", advice="Хэцүү жишээ сонгох.", difficulty="hard"),
        InterviewQuestion(question_mn="Алдаанаасаа сургамж авсан туршлагаа ярина уу", category="behavioral",
            sample_answer="Алдаагаа хүлээн зөвшөөрч, юу сурсныг хэлнэ.",
            advice="Хуурамч алдаа хэлэхгүй.", difficulty="medium"),
        InterviewQuestion(question_mn="Стресстэй нөхцөлд хэрхэн ажилладаг вэ?", category="behavioral",
            sample_answer="STAR жишээ. Эрэмбэлэх чадвар.", advice="Арга зам харуулах.", difficulty="medium"),
        InterviewQuestion(question_mn="Багийн гишүүнтэй зөрчилдөөн шийдсэн туршлага?", category="behavioral",
            sample_answer="Эерэг, бүтээмжтэй шийдсэн жишээ.",
            advice="Процессоор шийдсэн байдал.", difficulty="hard"),
        InterviewQuestion(question_mn="Удирдлагад эсэргүүцсэн туршлага?", category="behavioral",
            sample_answer="Профессионал байдлаар эсэргүүцсэн жишээ.",
            advice="Шалтгаантай байх.", difficulty="hard"),
        InterviewQuestion(question_mn="Санал болгоогүй үүрэг хариуцсан туршлага?", category="behavioral",
            sample_answer="Санаачлагатай байсан жишээ.", advice="Багийн үр ашиг.", difficulty="medium"),

        # Quiz (15)
        InterviewQuestion(question_mn="HTTP статус код 404 юуг илэрхийлдэг вэ?", category="technical",
            is_quiz=True, option_a="Серверийн дотоод алдаа", option_b="Хандалт хориотой",
            option_c="Хүссэн resource олдсонгүй", option_d="Хүсэлт амжилттай", correct_option="c",
            explanation="404 Not Found — resource сервер дээр олдсонгүй.", difficulty="easy"),
        InterviewQuestion(question_mn="Аль нь NoSQL өгөгдлийн сан вэ?", category="technical",
            is_quiz=True, option_a="PostgreSQL", option_b="MongoDB", option_c="MySQL", option_d="Oracle",
            correct_option="b", explanation="MongoDB document-based NoSQL.", difficulty="easy"),
        InterviewQuestion(question_mn="Git-д сүүлийн commit-ийг буцаах тушаал?", category="technical",
            is_quiz=True, option_a="git undo", option_b="git revert HEAD",
            option_c="git remove last", option_d="git delete", correct_option="b",
            explanation="git revert HEAD — шинэ commit үүсгэж буцаана.", difficulty="medium"),
        InterviewQuestion(question_mn="JavaScript-д аль нь primitive data type биш вэ?", category="technical",
            is_quiz=True, option_a="string", option_b="number", option_c="object", option_d="boolean",
            correct_option="c", explanation="object нь reference type.", difficulty="easy"),
        InterviewQuestion(question_mn="React-д state өөрчлөгдөх үед юу болдог вэ?", category="technical",
            is_quiz=True, option_a="Хуудас reload", option_b="Component дахин render",
            option_c="Шинэчлэгдэхгүй", option_d="Алдаа гарна", correct_option="b",
            explanation="State өөрчлөгдвөл re-render.", difficulty="medium"),
        InterviewQuestion(question_mn="SQL-д мөр устгах тушаал?", category="technical",
            is_quiz=True, option_a="REMOVE FROM", option_b="DELETE FROM",
            option_c="DROP FROM", option_d="ERASE FROM", correct_option="b",
            explanation="DELETE FROM мөр устгана.", difficulty="easy"),
        InterviewQuestion(question_mn="Нууц үгийг DB-д яаж хадгалах зөв вэ?", category="technical",
            is_quiz=True, option_a="Plain text", option_b="Base64",
            option_c="Bcrypt hash", option_d="Reverse", correct_option="c",
            explanation="Bcrypt one-way hash.", difficulty="medium"),
        InterviewQuestion(question_mn="JWT token ямар форматтай вэ?", category="technical",
            is_quiz=True, option_a="XML", option_b="header.payload.signature",
            option_c="Binary", option_d="Тоо", correct_option="b",
            explanation="3 хэсэгтэй JSON encode.", difficulty="medium"),
        InterviewQuestion(question_mn="Python-д list болон tuple ялгаа?", category="technical",
            is_quiz=True, option_a="Ялгаагүй", option_b="List mutable, tuple immutable",
            option_c="Tuple удаан", option_d="List зөвхөн тоо", correct_option="b",
            explanation="List өөрчилж болно, tuple болохгүй.", difficulty="easy"),
        InterviewQuestion(question_mn="CSS priority хамгийн өндөр?", category="technical",
            is_quiz=True, option_a="Class", option_b="ID",
            option_c="!important", option_d="Inline", correct_option="c",
            explanation="!important бүгдийг давна.", difficulty="medium"),
        InterviewQuestion(question_mn="Ярилцлагад хамгийн чухал юу вэ?", category="general",
            is_quiz=True, option_a="Үнэтэй хувцас", option_b="Өөрийгөө мэдрэх, компани судлах",
            option_c="Удаан хариулах", option_d="Өмнөх ажлаа шүүмжлэх", correct_option="b",
            explanation="Бэлтгэл амжилтын үндэс.", difficulty="easy"),
        InterviewQuestion(question_mn="'Сул тал' асуултад зөв хариулт?", category="general",
            is_quiz=True, option_a="Сул тал байхгүй", option_b="Хамаагүй сул тал",
            option_c="Бодит сул + сайжруулалт", option_d="Perfectionist", correct_option="c",
            explanation="Хөгжүүлэх чадварыг харуулна.", difficulty="medium"),
        InterviewQuestion(question_mn="Ярилцлагад хэр өмнө очих вэ?", category="general",
            is_quiz=True, option_a="Яг цагтаа", option_b="30 мин өмнө",
            option_c="10-15 мин өмнө", option_d="1 цагийн өмнө", correct_option="c",
            explanation="10-15 мин тохиромжтой.", difficulty="easy"),
        InterviewQuestion(question_mn="'Танд юу асуух уу?' гэхэд?", category="general",
            is_quiz=True, option_a="Байхгүй", option_b="Цалин шууд",
            option_c="Бодолтой асуулт", option_d="Хувийн амьдрал", correct_option="c",
            explanation="Сонирхлыг харуулна.", difficulty="medium"),
        InterviewQuestion(question_mn="Онлайн ярилцлагын чухал бэлтгэл?", category="general",
            is_quiz=True, option_a="Шинэ камер", option_b="Интернэт, камер, микрофон шалгах",
            option_c="Наушник", option_d="Зөвхөн камер", correct_option="b",
            explanation="Бүх техник урьдчилан шалгана.", difficulty="easy"),
    ]
    db.add_all(questions)
    db.commit()
    print(f"✓ Seeded {len(questions)} interview questions")


def _seed_scholarships(db):
    scholarships = [
        Scholarship(name="Монголын Хөгжлийн Банкны тэтгэлэг", organization="Хөгжлийн банк", target="Бакалавр", requirements="GPA 3.0+, санхүүгийн хэрэгцээ", deadline=date(2026, 6, 30), website_url="https://mdb.mn", description="Санхүүгийн салбарын оюутнуудад зориулсан"),
        Scholarship(name="Голомт банкны тэтгэлэг", organization="Голомт банк", target="Бакалавр", requirements="GPA 3.2+, идэвхтэй оролцоо", deadline=date(2026, 5, 15), website_url="https://golomtbank.com", description="Бизнесийн чиглэлийн оюутнуудад"),
        Scholarship(name="МУИС-ийн Ректорын тэтгэлэг", organization="МУИС", target="Бакалавр", requirements="GPA 3.5+", deadline=date(2026, 9, 1), website_url="https://num.edu.mn", description="Сурлагын амжилт өндөртэй оюутнуудад"),
        Scholarship(name="ШУТИС-ийн тэтгэлэг", organization="ШУТИС", target="Бакалавр", requirements="GPA 3.0+, инженерийн чиглэл", deadline=date(2026, 8, 15), website_url="https://must.edu.mn", description="Инженерийн чиглэлийн оюутнуудад"),
        Scholarship(name="Оюу толгой тэтгэлэг", organization="Оюу толгой", target="Бакалавр", requirements="Уул уурхайн чиглэл, GPA 3.0+", deadline=date(2026, 4, 30), website_url="https://ot.mn", description="Уул уурхайн салбарын оюутнуудад"),
        Scholarship(name="MCS группын тэтгэлэг", organization="MCS Group", target="Бакалавр", requirements="Бизнесийн удирдлага, маркетинг", deadline=date(2026, 7, 1), website_url="https://mcs.mn", description="Бизнесийн чиглэлийн оюутнуудад"),
    ]
    db.add_all(scholarships)
    db.commit()
    print(f"✓ Seeded {len(scholarships)} scholarships")


def _seed_advice(db):
    advices = [
        # CV (4)
        Advice(category="cv", sort_order=1,
            title="Сайн CV-ийн үндсэн бүтэц",
            summary="Мэргэжлийн CV-нд заавал байх ёстой хэсгүүд, бүтэц.",
            content="""Сайн CV нь тодорхой бүтэцтэй, унших хүнд хурдан мэдээлэл өгөх ёстой.

1. Хувийн мэдээлэл
   - Бүтэн нэр, утас, и-мэйл, LinkedIn (байгаа бол)
   - Зураг заавал биш
   - Төрсөн он, гэрлэлтийн байдал шаардлагагүй

2. Мэргэжлийн товч тайлбар (Summary)
   - 2-3 өгүүлбэр: хэн байна, юу хийдэг, ямар зорилготой
   - CV-ийн дээд хэсэгт тавина

3. Ажлын туршлага
   - Сүүлийн туршлагаас эхэлж буурах дарааллаар
   - Байгууллага, албан тушаал, огноо
   - 3-5 bullet point action verb-ээр эхэлсэн
   - Тоон үр дүн (%, $, хэмжээ) заавал

4. Боловсрол
   - Их сургууль, мэргэжил, GPA (3.0+ бол)
   - Онцгой амжилт

5. Ур чадвар
   - Техникийн (програм, хэл)
   - Хэл — түвшин (B2, IELTS 7.0)

6. Гэрчилгээ, төсөл (сонголтоор)

Нийт 1-2 хуудас. Төгсөгч — 1 хуудас хангалттай.""",
            external_links=json.dumps([
                {"title": "Canva CV загварууд", "url": "https://www.canva.com/resumes/templates/"},
                {"title": "Action verbs жагсаалт", "url": "https://www.themuse.com/advice/185-powerful-verbs-that-will-make-your-resume-awesome"},
            ]),
            youtube_url="https://www.youtube.com/watch?v=y8YH0Qbu5h4"),

        Advice(category="cv", sort_order=2,
            title="CV-д гардаг 10 нийтлэг алдаа",
            summary="Ажил олгогчийн CV-г шууд татгалзах шалтгаан болдог алдаанууд.",
            content="""Ажил олгогч CV-г дунджаар 7 секундэд харна. Алдаа маш муу сэтгэгдэл үлдээнэ.

1. Бичгийн алдаа — заавал spellcheck
2. Хэт ерөнхий үг ("хариуцлагатай" гэх мэт клишé)
3. Хэт урт — 1-2 хуудсаар хязгаарлах
4. Хамааралгүй туршлага оруулах
5. Тоон үр дүн байхгүй ("борлуулалт нэмэгдүүлсэн" биш "40% өсгөсөн")
6. Буруу форматлалт — PDF-ээр илгээх
7. И-мэйл хаяг тохиромжгүй
8. Зураг муу — заавал биш, оруулвал профессионал
9. Хувийн мэдээлэл хэт их (шашин, гэрлэлт гэх мэт)
10. Cover letter бичихгүй""",
            external_links=json.dumps([
                {"title": "Grammarly", "url": "https://www.grammarly.com"},
            ])),

        Advice(category="cv", sort_order=3,
            title="ATS-д таних CV бичих арга",
            summary="Том компаниуд ATS систем ашигладаг. Үүнд таних CV хэрхэн бичих вэ?",
            content="""ATS (Applicant Tracking System) — CV-г автомат шүүдэг систем.

1. Keyword ашиглах
   - Job description-ийн үгсийг CV-д оруулах
   - Байгалийн байдлаар (keyword stuffing биш)

2. Энгийн формат
   - Table, column, text box биш
   - Стандарт heading: "Work Experience", "Education"

3. Сайн шрифт
   - Arial, Calibri, Times New Roman
   - PDF формат

4. Огноо формат
   - "June 2023 - Present" буюу "06/2023"

5. Товчлолыг бүрэн бичих
   - "Bachelor of Science in Computer Science"
   - Эхэнд бүтнээр, хаалтанд товчилсон (BSc)

6. Стандарт bullet point — • эсвэл -

ATS-ийн дараа хүн харна. Хоёуланд нь тохиромжтой байх ёстой.""",
            youtube_url="https://www.youtube.com/watch?v=vPmxJWlmPpk"),

        Advice(category="cv", sort_order=4,
            title="CV-ийн ур чадвар хэсгийг хэрхэн бичих вэ?",
            summary="Ур чадварыг зөв категорилж, үнэн зөв түвшинг харуулах.",
            content="""Ур чадвар (Skills) — CV-ийн хамгийн чухал хэсгүүдийн нэг.

1. Категорилох
   - Техникийн: програмчлалын хэл, framework
   - Хэл: түвшинтэй
   - Soft skills: харилцаа, удирдлага

2. Түвшин
   - Intermediate / Advanced / Expert
   - Эсвэл жилээр "Python — 3 жил"
   - "Expert" гэж хэт хэлэхгүй

3. Холбогдох нь л
   - Job description-ийн шаардлагыг заавал

4. Хэлний түвшин стандартаар
   - CEFR: A1-C2
   - IELTS, TOEFL оноотой

5. Туршлагатай холбох
   - "Python" оруулсан бол туршлагад Python-аар хийсэн ажил

Жишээ:
Техникийн:
- Frontend: React (3 жил), TypeScript, Tailwind
- Backend: Node.js, PostgreSQL

Хэл:
- Монгол — Эх хэл
- Англи — B2 (IELTS 6.5)"""),

        # Interview (4)
        Advice(category="interview", sort_order=1,
            title="Ярилцлагын өмнө хийх 5 алхам",
            summary="Амжилттай ярилцлагын үндэс нь сайн бэлтгэл.",
            content="""Ярилцлагын амжилтын 80% нь бэлтгэл.

1. Компанийг судлах
   - Албан ёсны сайт, "About Us"
   - Сүүлийн мэдээ, пресс-релиз
   - LinkedIn дээр ажилчдыг хар
   - Бүтээгдэхүүн/үйлчилгээ туршиж үзэх
   - Glassdoor сэтгэгдэл

2. Албан тушаал судлах
   - Job description 2-3 удаа унших
   - Шаардлага бүрд тохирох жишээ бэлтгэх

3. Өөрийн CV-г давтах
   - CV-ийн бүх зүйлийг тайлбарлахад бэлэн
   - Хугацааны зөрөөг тайлбарлах

4. Асуултад бэлтгэх
   - Flashcard горимоор дадлагажих
   - STAR-ын 3-5 жишээ бэлтгэх

5. Логистик
   - Хаяг, зам Google Maps
   - Хувцас 1 өдрийн өмнө
   - Онлайн — техник туршилт

Нэмэлт: шөнө 7-8 цаг унтах, өглөөний хоол идэх.""",
            youtube_url="https://www.youtube.com/watch?v=HG68Ymazo18"),

        Advice(category="interview", sort_order=2,
            title="Ярилцлагын үед биеийн хэлний зөв байдал",
            summary="Биеийн хэл нь 55% сэтгэгдлийг бүрдүүлдэг.",
            content="""1. Орж ирэх
   - Хаалгыг тогшиж, инээмсэглэн орно
   - Гараа баталгаатай барих

2. Суух
   - Шулуун суух, нуруугаа түших биш
   - Хөлөө шалан дээр

3. Нүдний контакт
   - 5-7 секунд нэг удаа
   - Олон хүнтэй бол ээлжлэн

4. Инээмсэглэл
   - Цайвар, байгалийн

5. Гарын хөдөлгөөн
   - Тодруулахад ашиглах
   - Нүүрээ барих биш

6. Дуу хоолой
   - Тодорхой, хангалттай
   - "Ээ", "уг нь" багасгах

7. Онлайн
   - Камер нүдний түвшинд
   - Камерыг хардаг, дэлгэц биш
   - Гэрэл урдаас
   - Орчин цэвэр"""),

        Advice(category="interview", sort_order=3,
            title="Хүнд асуултад хэрхэн хариулах вэ",
            summary="'Сул тал', 'Яагаад гарсан бэ?' гэх мэт асуултад.",
            content="""1. "Сул тал юу вэ?"
Хууль: Бодит сул + сайжруулалт
Жишээ: "Нийтийн өмнө илтгэх стресстэй байсан. Тиймээс 6 сар Toastmasters-д оролцсон. Одоо 50+ хүний өмнө ярьж чадна."
❌ "Перфекционист" — клишé

2. "Яагаад гарсан бэ?"
Хууль: Эерэг, ирээдүйд чиглэсэн
Жишээ: "2.5 жил ажилласан, маш их сурсан. Одоо илүү том scale төсөл, шинэ технологи сурахыг хүсэж байна."
❌ Шүүмжлэл

3. "Яагаад таныг сонгох вэ?"
Хууль: Ур чадвар + тохиромж + сэдэл
Жишээ: "Танай бүтээгдэхүүн миний 3 жилийн React туршлагатай тохирч байна."

4. "5 жилийн дараа хаана?"
Хууль: Өсөлт + компанийн замналтай уялдаа
Жишээ: "Senior болж, дараа нь tech lead — танай компанид ийм боломж бий."

5. "Цалин хэд?"
Хууль: Тодорхой хүрээ + уян хатан
Жишээ: "3.5-4.5 сая хүрээ, нийт багц хэлбэлзэнэ."

Анхаар: 1-2 минутаас хэтрэхгүй, тодорхой жишээгээр."""),

        Advice(category="interview", sort_order=4,
            title="Ярилцлагын дараа хийх зүйлс",
            summary="Ярилцлагын үр дүн дараах үйлдлээс хамаардаг.",
            content="""1. Талархах (24 цагийн дотор)
Thank You имэйл, товч, чухал сэдвийг дурдсан.

Загвар:
"Хүндэт [нэр],
Өнөөдөр уулзсан цагт талархаж байна. [Тодорхой сэдэв] сонирхолтой байлаа. [Туршлага]-ыг оруулах үнэтэй гэж итгэж байна.
Хүндэтгэсэн, [Нэр]"

2. Өөрийгөө үнэлэх
- Аль нь сайн, аль нь тааруу байсан?
- Юу сурсан?

3. Хүлээх
- Хариу өгнө гэсэн хугацааг хүлээх

4. Follow-up (1 7 хоногийн дараа)
- Хариу байхгүй бол эелдэг follow-up

5. Татгалзсан бол
- Эелдэг хариу, feedback асуух

6. Санал ирсэн бол
- 24-48 цаг бодох гуйж болно
- Цалин, огноо, тэтгэмж нарийн асуух
- Бичгээр баталгаа"""),

        # Job Search (4)
        Advice(category="job_search", sort_order=1,
            title="Монгол дахь гол ажлын сайтууд",
            summary="Ажил хайх хамгийн түгээмэл онлайн эх сурвалжууд.",
            content="""1. Worki.mn — хамгийн том, өдөр бүр шинэчлэгдэнэ
2. Jobs.mn — маш их байрлал, имэйл мэдэгдэлтэй
3. Zangia.mn — засгийн газар, олон улсын
4. LinkedIn — гадаад, remote их
5. Unread.today — оюутны, intern
6. Facebook группууд — салбар тус бүрт
7. Компанийн сайт шууд — careers хуудас

Зөвлөмж: олон сайт дээр CV үүсгэх, өдөрт 15-30 минут зарцуулах.""",
            external_links=json.dumps([
                {"title": "Worki.mn", "url": "https://worki.mn"},
                {"title": "Jobs.mn", "url": "https://jobs.mn"},
                {"title": "Zangia.mn", "url": "https://zangia.mn"},
                {"title": "LinkedIn", "url": "https://www.linkedin.com"},
                {"title": "Unread.today", "url": "https://unread.today"},
            ])),

        Advice(category="job_search", sort_order=2,
            title="Networking — ажлын 70% нь энэ замаар олддог",
            summary="Онлайнаар зарлагдахаас өмнөх далд боломжуудыг хэрхэн олох вэ?",
            content="""Ажлын 70-80% нь 'hidden job market'-аар олддог.

1. LinkedIn
   - Профайл бүрэн бөглөх
   - Connection хүсэх
   - Өдөр 15 мин идэвх

2. Арга хэмжээ
   - Tech Talks, карьерын форум
   - Alumni эвент

3. Coffee chat
   - "15 минут цаг гаргаж ажлынхаа тухай хуваалцаж чадах уу?"
   - Зорилго: мэдээлэл, танилцах

4. Ангийнхан, багш нартай холбоо
   - Жилд 1-2 удаа

5. Community
   - Meetup.com
   - Discord/Slack

6. Mentor
   - 5-10 жилийн туршлагатай
   - Сард 1 удаа

7. Өгөхөөс эхлэх
   - Бусдад тус болох — зөвлөмж, контакт

Networking бол 'өгөөд авах' мөчлөг. Хэрэгцээтэй үед биш тогтмол."""),

        Advice(category="job_search", sort_order=3,
            title="Cover letter (танилцуулга захидал) бичих",
            summary="CV-тэй хамт илгээдэг 1 хуудасны захидал.",
            content="""Cover letter нь "яагаад таныг сонгох вэ?"-д хариулна.

Бүтэц (1 хуудас, 3-4 догол):

1. Танилцуулга (2-3 өгүүлбэр)
Жишээ: "Танай Worki.mn дээр Frontend Developer байрлалд өргөдөл гаргаж байна. 3 жил React-р ажилласан туршлагатай, [бүтээгдэхүүн] сонирхолтой."

2. Яагаад би тохирох вэ? (4-5 өгүүлбэр)
Жишээ: "[Компани] дээр 50,000+ хэрэглэгчтэй платформын frontend-г хөгжүүлсэн. Next.js ашиглан ачаалалтын хугацааг 60% богиносгосон. Танай 'хурдан, scale' шаардлагад тохирно."

3. Яагаад тус компани (3-4 өгүүлбэр)
Компанийн онцлогт дуртай зүйл, таны хэрэгцээтэй уялдаа.

4. Уулзалт хүсэх (1-2 өгүүлбэр)
Жишээ: "Танай багт оруулах үнэ цэнээ дэлгэрэнгүй ярилцахад бэлэн."

Зөвлөмж:
- Template биш, компани бүрт тусгайлан
- 400 үгээс хэтрэхгүй
- Тодорхой нэрээр ("To whom it may concern" биш)
- PDF-ээр"""),

        Advice(category="job_search", sort_order=4,
            title="Remote ажил олох арга",
            summary="Олон улсын компаниудтай remote ажиллах боломжууд.",
            content="""1. Сайтууд
   - RemoteOK.com, WeWorkRemotely.com
   - Remotive.io, Toptal
   - Arc.dev, Turing.com

2. Бэлтгэл
   - Англи B2+
   - GitHub, portfolio
   - Англи CV
   - LinkedIn, Stack Overflow profile

3. Цагийн бүс
   - US: 12-13 цаг зөрөө
   - Europe: 6-8 цаг

4. Харилцаа
   - Англи бичгийн чадвар
   - Zoom дадлага
   - Async communication

5. Цалин
   - levels.fyi, glassdoor
   - Монголоос 2-5 дахин
   - Татвар, insurance өөрөө

6. Эхлэх
   - Freelance жижиг ажлаас
   - Open source оролцох
   - Portfolio төсөл

7. Нэхэмжлэх
   - Мэргэжлийн нягтлан

Remote ажил нь сахилга бат шаарддаг.""",
            external_links=json.dumps([
                {"title": "RemoteOK", "url": "https://remoteok.com"},
                {"title": "We Work Remotely", "url": "https://weworkremotely.com"},
                {"title": "Arc.dev", "url": "https://arc.dev"},
            ])),

        # Career (4)
        Advice(category="career", sort_order=1,
            title="Эхний ажлаа сонгохдоо юуг анхаарах вэ?",
            summary="Өсөлт, компанийн хэмжээ, цалин — юуг тэргүүн чухалчлах вэ?",
            content="""1. Суралцах боломж
   - Mentor байгаа эсэх
   - Юу сурах вэ?
   - Technology stack шинэ үү?

2. Компанийн хэмжээ
Startup (10-50):
+ Олон чиглэл, хурдан өсөх
— Ментор бага, цалин бага

Дунд (50-500):
+ Бүтэц, тогтвортой
~ Дунд өсөлт

Том (500+):
+ Өндөр цалин, тогтвортой
— Удаан өсөлт, bureaucracy

3. Багийн соёл
- "Эхний 3 сар ямар байх вэ?"
- Current employees-тэй уулзах
- Glassdoor

4. Технологи
- Modern stack уу?
- 5 жилд хэрэгтэй байх уу?

5. Цалин (3-р байранд)
- Зах зээлийн 80-120%

6. Лайф баланс
- 9-6 уу, 9-9 уу?
- Remote боломж

Эцэст: эхний ажилд 1-2 жил үлдэх."""),

        Advice(category="career", sort_order=2,
            title="Карьераа хурдан ургуулах 7 дадал",
            summary="Нотлогдсон карьерын өсөлтийн дадал.",
            content="""1. Өдөр бүр суралцах
   - 30 мин — 1 цаг
   - Подкаст, ном, курс

2. Тодорхой зорилго
   - SMART: Specific, Measurable, Achievable, Relevant, Time-bound
   - 1 жил + 3 сар milestone

3. Mentor
   - Сард 1 удаа
   - Асуулт бэлдэж

4. Харагдах бай
   - Баг, удирдлагад сонсгох
   - Meeting идэвхтэй
   - LinkedIn пост

5. Хүнд ажлыг авах
   - "Би хийе"
   - Шинэ чиглэл

6. Feedback
   - Сард 1 удаа 1-1
   - "Яаж илүү сайн болох вэ?"

7. Эрүүл мэнд
   - 7-8 цаг унтах
   - Спорт
   - Burnout-аас зайлсхийх

Хамгийн чухал: тууштай байх."""),

        Advice(category="career", sort_order=3,
            title="Цалингаа яаж хэлэлцэх вэ?",
            summary="Салари талаар яриа хийх, илүү цалин авах арга.",
            content="""1. Судалгаа
   - Levels.fyi, Glassdoor
   - Worki.mn
   - Мэргэжил нэгтнүүдээс

2. Анкор (anchoring)
   - Өндөр хувилбараас эхлэх
   - "4-4.5 сая" гэх "3-4 сая" биш

3. Нийт багц
   - Цалин (gross, net)
   - Bonus, stock
   - Insurance, амралт
   - Remote, training budget

4. Үнэ цэнэ баримттай
   - "X ажил, Y үр дүн"

5. Цаг нь ирэхэд
   - Санал ирсний дараа л
   - Эхний ярилцлагад нуух

6. Сөрөг тохирол
   - "Надад [X] тохиромжтой"
   - Дараа чимээгүй — дарамт тэдэнд

7. Баримтжуулах
   - Бичгээр санал
   - Огноо, цалин, тэтгэмж

Хамгийн муу асуулт — асуугаагүй асуулт."""),

        Advice(category="career", sort_order=4,
            title="Burnout-аас хэрхэн зайлсхийх вэ?",
            summary="Ажлын ачаалал, стресс ихсэхэд өөрийгөө хамгаалах арга.",
            content="""Шинж тэмдгүүд:
- Байнга ядрах
- Ажилдаа дургүй
- Сэтгэл санаа муу
- Нойргүйдэл, толгой өвдөх
- Бүтээмж буурах

1. Ажил-амьдралын хил
   - Ажлын имэйл гадуур харахгүй
   - Notification унтраах
   - Weekend ажиллахгүй

2. Цагийн удирдлага
   - Pomodoro: 25 мин + 5 мин
   - Өдрийн 3 чухал ажил
   - "Yes" биш "No"

3. Бие эрүүл мэнд
   - 7-8 цаг унтах
   - Өдөрт 30 мин хөдөлгөөн
   - Өглөө наранд гарах

4. Сэтгэл санаа
   - Сэтгэлзүйчтэй уулзах (Монголд байдаг)
   - Meditation, yoga
   - Дур сонирхол

5. Ажлын байранд
   - Удирдлагатай ачаалал ярилцах
   - Амралт бүрэн авах

6. Үнэ цэнэ эргэн санах
   - Ямар зорилгын төлөө?
   - Ажил нэг хэсэг, бүгд биш

7. Хэзээ ажил солих?
   - 6 сараас илүү шинж тэмдэг
   - Сайжруулах боломжгүй бол

Burnout нь сул дорой байдал биш. Өөртөө эелдэг хандаарай."""),
    ]
    db.add_all(advices)
    db.commit()
    print(f"✓ Seeded {len(advices)} advice articles")