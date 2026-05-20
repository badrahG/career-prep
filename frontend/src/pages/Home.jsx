import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import CVPreview from "../components/CVPreview";

var SAMPLE_CV = {
  educations: [
    { school: "Монгол Улсын Их Сургууль", level: "Бакалавр", major: "Компьютерын ухаан", gpa: "3.8", start_year: "2018", end_year: "2022" },
  ],
  experiences: [
    { position: "Frontend Developer", company: "Tech Solutions LLC", start_date: "2022-06", end_date: "", description: "React, JavaScript ашиглан веб аппликейшн хөгжүүлэлт хийсэн. Баг хамт олонтой нягт хамтран ажилласан." },
    { position: "Дадлагажигч", company: "DataMon ХХК", start_date: "2021-06", end_date: "2021-12", description: "Мэдээллийн сангийн удирдлага, тайлан боловсруулалт." },
  ],
  skills: [],
};

var SAMPLE_INFO = {
  lastName: "Батбаяр", firstName: "Нарантуяа",
  email: "n.batbayar@email.com", phone: "9911-2233", address: "Улаанбаатар хот",
  about: "Туршлагатай програм хөгжүүлэгч. Баг хамт олонтой нягт хамтран ажиллах дуртай. Шинэ технологийг хурдан эзэмшдэг.",
  personalSkills: ["Багаар ажиллах", "Цагийн менежмент", "Харилцааны чадвар"],
  techSkills: ["JavaScript", "React", "Python", "SQL"],
  profSkills: ["Бичиг баримт боловсруулах"],
  artSkills: [], sportSkills: [],
  languages: [{ name: "Англи хэл", level: "Ахисан дунд шат" }],
  certs: [{ name: "AWS Certified Cloud Practitioner", organization: "Amazon", start_date: "2023" }],
  internships: [],
  awards: [{ name: "Оны шилдэг ажилтан — 2023", year: "2023" }],
};

export default function Home() {
  var { token } = useAuth();

  var features = [
    {
      icon: "CV",
      title: "CV үүсгэх",
      desc: "3 загвартай, алхам алхмаар дагадаг форм. PDF татаж авна.",
      link: "/cv",
      color: "bg-gradient-to-br from-violet-500 to-indigo-600",
    },
    {
      icon: "IV",
      title: "Ярилцлагын бэлтгэл",
      desc: "25+ асуулт, 3 горим: Flashcard, Quiz, STAR дадлага.",
      link: "/interview",
      color: "bg-gradient-to-br from-purple-500 to-violet-600",
    },
    {
      icon: "AD",
      title: "Карьерын зөвлөмж",
      desc: "CV бичих, ярилцлага, ажил олох, карьер ургуулах 16+ зөвлөмж.",
      link: "/advice",
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      icon: "SH",
      title: "Тэтгэлэг & Internship",
      desc: "Дотоодын тэтгэлэг, дадлагын хөтөлбөрүүд нэг газар.",
      link: "/scholarship",
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
  ];

  var templates = [
    {
      name: "Монгол хэв маяг",
      tagline: "Орчин үеийн, минималист",
      desc: "Хурц навy өнгөтэй, IT болон дизайны салбарт тохиромжтой.",
      preview: "modern",
    },
    {
      name: "Ази хэв маяг",
      tagline: "Цэгцтэй, бүрэн мэдээлэлтэй",
      desc: "Санхүү, эрх зүй, боловсролын салбарт тохиромжтой загвар.",
      preview: "classic",
    },
    {
      name: "Европ хэв маяг",
      tagline: "Цэвэр, achievement-focused",
      desc: "Олон улсын болон modern ажлын орчинд тохирох, агуулга төвтэй загвар.",
      preview: "minimal",
    },
  ];

  var steps = [
    { num: 1, title: "Бүртгүүлэх", desc: "Бүртгэлтэй бол шууд нэвтэрч, үгүй бол 1 минутад бүртгүүлнэ." },
    { num: 2, title: "Профайл үүсгэх", desc: "Боловсрол, туршлага, ур чадвараа оруулна." },
    { num: 3, title: "CV үүсгэх, дадлага хийх", desc: "CV үүсгэх, ярилцлагад бэлтгэх, тэтгэлэг хайх." },
    { num: 4, title: "Ажилд орох", desc: "Бэлэн болсныхоо дараа итгэлтэйгээр ярилцлагад орж чадна." },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CareerPrep" className="w-9 h-9 drop-shadow-sm" />
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">CareerPrep</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Career Platform</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition">Боломжууд</a>
            <a href="#templates" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition">CV Загвар</a>
            <a href="#how" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition">Хэрхэн ажилладаг</a>
          </div>

          <div className="flex items-center gap-2">
            {token ? (
              <Link to="/dashboard" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden md:inline-block px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium transition">Нэвтрэх</Link>
                <Link to="/register" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition">
                  Эхлэх →
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-violet-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-violet-400/10 to-indigo-400/10 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 px-3 py-1.5 rounded-lg text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 bg-violet-600 rounded-full"></span>
                Залуучуудад зориулсан платформ
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-5">
                Ажилдаа бэлэн бол,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">амжилтанд ойрхон</span>
              </h1>

              <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-lg">
                CV үүсгэх, ярилцлагад бэлтгэх, тэтгэлгийн мэдээлэл авах бүх зүйлсийг нэг газраас. Үнэгүй ашиглаарай.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {token ? (
                  <Link to="/dashboard" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-md transition inline-flex items-center gap-2">
                    Dashboard руу орох →
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-md transition inline-flex items-center gap-2">
                      Үнэгүй эхлэх →
                    </Link>
                    <a href="#features" className="border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      Дэлгэрэнгүй үзэх
                    </a>
                  </>
                )}
              </div>

              <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Үнэгүй</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Монгол хэлээр</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>1 минутад эхлэнэ</span>
                </div>
              </div>
            </div>

            {/* Right: 3 overlapping real CV previews */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-[460px] h-[360px]">

                {/* Back card — Modern */}
                <div className="absolute top-0 left-0 w-[200px] h-[283px] rounded-2xl shadow-xl overflow-hidden transform -rotate-6 z-10 border-2 border-violet-200">
                  <div style={{ width: "794px", transformOrigin: "top left", transform: "scale(0.252)", pointerEvents: "none" }}>
                    <CVPreview cv={SAMPLE_CV} info={SAMPLE_INFO} template="modern" />
                  </div>
                </div>

                {/* Back-right card — Classic */}
                <div className="absolute top-4 right-0 w-[200px] h-[283px] rounded-2xl shadow-xl overflow-hidden transform rotate-4 z-20 border-2 border-gray-200">
                  <div style={{ width: "794px", transformOrigin: "top left", transform: "scale(0.252)", pointerEvents: "none" }}>
                    <CVPreview cv={SAMPLE_CV} info={SAMPLE_INFO} template="classic" />
                  </div>
                </div>

                {/* Front center card — Minimal */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[210px] h-[297px] rounded-2xl shadow-2xl overflow-hidden z-30 border-2 border-indigo-100">
                  <div style={{ width: "794px", transformOrigin: "top left", transform: "scale(0.264)", pointerEvents: "none" }}>
                    <CVPreview cv={SAMPLE_CV} info={SAMPLE_INFO} template="minimal" />
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute bottom-2 left-10 z-40 w-[72px] h-[72px] bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex flex-col items-center justify-center shadow-xl text-white text-center border-4 border-white">
                  <span className="text-[11px] font-extrabold leading-tight">2x</span>
                  <span className="text-[8px] font-semibold leading-tight opacity-90">хурдан</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 pt-16 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "3", label: "CV загвар" },
              { value: "25+", label: "Ярилцлагын асуулт" },
              { value: "16+", label: "Карьерын зөвлөмж" },
              { value: "100%", label: "Үнэгүй" },
            ].map(function (s, i) {
              return (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">{s.value}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mt-2">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Боломжууд</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">Бүх шаардлагатай зүйл нэг газар</h2>
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Ажлын хайлтын бүх шатанд танд тус болох 4 гол модуль.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(function (f, i) {
              return (
                <Link key={i} to={f.link}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-md transition group shadow-sm">
                  <div className={"w-12 h-12 rounded-xl flex items-center justify-center mb-4 " + f.color}>
                    <span className="text-white font-bold text-sm">{f.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                  <div className="mt-4 text-xs text-violet-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                    Үзэх →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CV Templates */}
      <section id="templates" className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">CV Загварууд</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">3 мэргэжлийн загвар</h2>
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Таны мэргэжилд тохирсон загвар сонгож, хувийн мэдээллээ оруулан CV үүсгэнэ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map(function (t, i) {
              return (
                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-md transition group shadow-sm">
                  <div className="h-[420px] bg-white border-b border-gray-100 relative overflow-hidden">
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "794px",
                      transformOrigin: "top left",
                      transform: "scale(0.385)",
                      pointerEvents: "none",
                    }}>
                      <CVPreview cv={SAMPLE_CV} info={SAMPLE_INFO} template={t.preview} />
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition">{t.name}</h3>
                      <span className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-600 border border-violet-100 dark:border-violet-800 px-2 py-0.5 rounded-lg font-medium">Үнэгүй</span>
                    </div>
                    <p className="text-xs text-violet-600 font-semibold mb-2">{t.tagline}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            {token ? (
              <Link to="/cv/new" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-md transition">
                CV үүсгэж эхлэх →
              </Link>
            ) : (
              <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-md transition">
                Бүртгүүлж CV үүсгэх →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 md:py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Хэрхэн ажилладаг</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">4 алхамд ажилд ойртоно</h2>
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Энгийн бөгөөд үр дүнтэй үйл явц.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(function (s, i) {
              return (
                <div key={i} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-[calc(50%+32px)] right-0 h-0.5 bg-gray-100 dark:bg-gray-700"></div>
                  )}
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:border-violet-200 dark:hover:border-violet-600 transition relative z-10 shadow-sm">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                      {s.num}
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Яагаад CareerPrep</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-5">
                Залуучуудын карьерын замд<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">итгэлтэй түнш</span>
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Оюутан, шинэ төгсөгчдөд зориулсан бүрэн цогц платформ. Туршлагагүй байсан ч мэргэжлийн түвшинд CV үүсгэж, ярилцлагад итгэлтэйгээр орох боломжтой.
              </p>
              <ul className="space-y-3">
                {[
                  "100% Монгол хэлээр — ойлгомжтой, танил үг хэллэг",
                  "Үнэн зөв мэдээлэл — орон нутгийн ажлын зах зээлд тулгуурласан",
                  "Бүрэн үнэгүй — далд төлбөр байхгүй, бүртгэл нэг минутад",
                  "Аюулгүй — таны мэдээлэл шифрлэгдэж хадгалагдана",
                ].map(function (item, i) {
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">✓</div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "3", label: "CV загвар", color: "bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-400" },
                { num: "25+", label: "Ярилцлагын асуулт", color: "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400" },
                { num: "16+", label: "Карьерын зөвлөмж", color: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400" },
                { num: "6+", label: "Дотоодын тэтгэлэг", color: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400" },
              ].map(function (s, i) {
                return (
                  <div key={i} className={"border rounded-2xl p-6 " + s.color}>
                    <div className="text-4xl md:text-5xl font-bold mb-2">{s.num}</div>
                    <div className="text-sm font-medium opacity-80">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Түгээмэл асуулт</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">Танд асуулт байна уу?</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: "CareerPrep үнэгүй юу?", a: "Тийм, бүх функц үнэгүй. Далд төлбөр байхгүй." },
              { q: "Хэн ашиглаж болох вэ?", a: "Их дээд сургуулийн оюутан, шинэ төгсөгч, ажил хайж буй хэн ч ашиглаж болно." },
              { q: "CV-гээ татаж авч болох уу?", a: "Тийм, үүсгэсэн CV-гээ PDF форматаар татаж авч болно." },
              { q: "Өгөгдөл минь аюулгүй юу?", a: "Таны нууц үг bcrypt хэшлэгдсэн, холболт HTTPS, дэлгэрэнгүйг Нууцлалын бодлогоос уншина." },
              { q: "Хэрхэн эхлэх вэ?", a: "Бүртгэгдээд и-мэйлээ баталгаажуулж, профайлаа бөглөөд шууд эхэлнэ. 2-3 минутын зөрөгтэй." },
            ].map(function (item, i) {
              return (
                <details key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl group shadow-sm">
                  <summary className="px-5 py-4 cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition">
                    <span>{item.q}</span>
                    <span className="text-violet-600 group-open:rotate-45 transition-transform text-xl flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                    {item.a}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Өнөөдрөөс ажилдаа бэлдэж эхлэе
          </h2>
          <p className="text-base md:text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Бүртгэл 1 минутад дуусна. Ямар ч төлбөр шаардахгүй.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {token ? (
              <Link to="/dashboard" className="bg-white text-violet-700 px-8 py-3 rounded-xl text-sm font-bold hover:bg-violet-50 transition shadow-sm">
                Dashboard руу орох →
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-white text-violet-700 px-8 py-3 rounded-xl text-sm font-bold hover:bg-violet-50 transition shadow-sm">
                  Үнэгүй бүртгүүлэх →
                </Link>
                <Link to="/login" className="border-2 border-white/40 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition">
                  Нэвтрэх
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center rounded-lg">
                  <span className="text-white font-bold text-xs tracking-wide">CP</span>
                </div>
                <span className="text-base font-bold text-white">CareerPrep</span>
              </Link>
              <p className="text-xs leading-relaxed">Залуучуудын ажилд орох бэлтгэлийг дэмжих Монгол платформ.</p>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Боломжууд</p>
              <ul className="space-y-2 text-xs">
                <li><Link to="/cv" className="hover:text-white transition">CV үүсгэх</Link></li>
                <li><Link to="/interview" className="hover:text-white transition">Ярилцлагын бэлтгэл</Link></li>
                <li><Link to="/advice" className="hover:text-white transition">Карьерын зөвлөмж</Link></li>
                <li><Link to="/scholarship" className="hover:text-white transition">Тэтгэлэг</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Компани</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition">Боломжууд</a></li>
                <li><a href="#templates" className="hover:text-white transition">CV загварууд</a></li>
                <li><a href="#how" className="hover:text-white transition">Хэрхэн ажилладаг</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Хууль эрх зүй</p>
              <ul className="space-y-2 text-xs">
                <li><Link to="/privacy" className="hover:text-white transition">Нууцлал</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Нөхцөл</Link></li>
                <li><a href="mailto:info@careerprep.mn" className="hover:text-white transition">info@careerprep.mn</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs">© 2026 CareerPrep. Бүх эрх хуулиар хамгаалагдсан.</p>
            <p className="text-xs">Монгол Улсад бүтээв.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
